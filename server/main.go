package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

type Vulnerability struct {
	ID          int     `json:"id"`
	CveID       string  `json:"cve_id"`
	Published   string  `json:"published"` // using string for simplicity in JSON
	Status      string  `json:"status"`
	Description string  `json:"description"`
	CvssScore   float64 `json:"cvss_score"`
}

type VulnrResponse struct {
	Vulnerabilities []struct {
		Cve struct {
			Id           string `json:"id"`
			Published    string `json:"published"`
			VulnStatus   string `json:"vulnStatus"`
			Descriptions []struct {
				Lang  string `json:"lang"`
				Value string `json:"value"`
			} `json:"descriptions"`
			Metrics struct {
				CvssMetricV2 []struct {
					CvssData struct {
						BaseScore float64 `json:"baseScore"`
					} `json:"cvssData"`
				} `json:"cvssMetricV2"`
				CvssMetricV31 []struct {
					CvssData struct {
						BaseScore float64 `json:"baseScore"`
					} `json:"cvssData"`
				} `json:"cvssMetricV31"`
			} `json:"metrics"`
		} `json:"cve"`
	} `json:"vulnerabilities"`
}

var db *sql.DB

func initDB() {
	// Retrieve environment variables
	dbUser := os.Getenv("DB_USER")
	dbPassword := os.Getenv("DB_PASSWORD")
	dbName := os.Getenv("DB_NAME")
	dbHost := os.Getenv("DB_HOST")
	dbPort := os.Getenv("DB_PORT")
	dbSSLMode := os.Getenv("DB_SSLMODE")

	// Create connection string
	connStr := fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=%s",
		dbUser, dbPassword, dbHost, dbPort, dbName, dbSSLMode)

	// Connect to the database
	var err error
	db, err = sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal(err)
	}
}

func main() {
	// Load environment variables from .env file
	err := godotenv.Load() // This will load .env file
	if err != nil {
		log.Fatalf("Error loading .env file")
	}

	r := mux.NewRouter()
	r.HandleFunc("/api/vulnerabilities", VulnerabilitiesHandler)

	initDB()
	defer db.Close()

	// Start the server
	headers := handlers.AllowedHeaders([]string{"X-Requested-With", "Content-Type", "Authorization"})
	methods := handlers.AllowedMethods([]string{"GET", "POST", "PUT", "HEAD", "OPTIONS"})
	origins := handlers.AllowedOrigins([]string{"*"})
	http.ListenAndServe(":8000", handlers.CORS(headers, methods, origins)(r))
}

// HomeHandler handles the home route
func VulnerabilitiesHandler(w http.ResponseWriter, r *http.Request) {
	// Get today's date
	today := time.Now()

	// Get the date of 10 days ago
	tenDaysAgo := today.AddDate(0, 0, -10)

	// Convert these dates into the desired format
	pubStartDate := tenDaysAgo.Format("2006-01-02T15:04:05.000-07:00")
	pubEndDate := today.Format("2006-01-02T15:04:05.000-07:00")

	// Construct the URL and fetch the data
	url := fmt.Sprintf("https://services.nvd.nist.gov/rest/json/cves/2.0/?pubStartDate=%s&pubEndDate=%s", pubStartDate, pubEndDate)
	resp, err := http.Get(url)
	if err != nil {
		log.Fatalln("Failed to retrieve data: ", err)
	}
	defer resp.Body.Close()

	var data VulnrResponse
	err = json.NewDecoder(resp.Body).Decode(&data)
	if err != nil {
		log.Fatalln("Failed to decode response", err)
	}

	// Save fetched vulnerabilities data to the DB using transactions
	tx, err := db.Begin()
	if err != nil {
		log.Fatal(err)
	}
	for _, vulnerability := range data.Vulnerabilities {
		cveID := vulnerability.Cve.Id
		published, _ := time.Parse("2006-01-02T15:04:05.000", vulnerability.Cve.Published)
		description := vulnerability.Cve.Descriptions[0].Value
		status := vulnerability.Cve.VulnStatus
		cvssScore := 0.0
		if len(vulnerability.Cve.Metrics.CvssMetricV2) > 0 {
			cvssScore = vulnerability.Cve.Metrics.CvssMetricV2[0].CvssData.BaseScore
		} else if len(vulnerability.Cve.Metrics.CvssMetricV31) > 0 {
			cvssScore = vulnerability.Cve.Metrics.CvssMetricV31[0].CvssData.BaseScore
		}

		_, err = tx.Exec("SELECT add_vulnerability($1, $2, $3, $4, $5)", cveID, published, description, status, cvssScore)
		if err != nil {
			log.Println(err)
			continue
		}
	}
	err = tx.Commit()
	if err != nil {
		log.Println(err)
	}

	// Filters out the latest
	rows, err := db.Query("SELECT * FROM vulnerabilities WHERE published > CURRENT_DATE - INTERVAL '30 DAYS'")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var vulnerabilities []Vulnerability
	for rows.Next() {
		var v Vulnerability
		if err := rows.Scan(&v.ID, &v.CveID, &v.Published, &v.Status, &v.Description, &v.CvssScore); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		vulnerabilities = append(vulnerabilities, v)
	}

	if err := rows.Err(); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(vulnerabilities)
}
