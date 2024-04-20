import { CircularProgressbarWithChildren, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

interface Props {
  score: number;
};

export default function CvssScore({ score }: Props) {
  const getPathColor = () => {
    if (score >= 7.5)
      return '#EE2222';
    if (score >= 5)
      return '#EEEE22';
    if (score >= 2.5)
      return '#2222EE';
    return '#22EE22';
  };

  return (
    <CircularProgressbarWithChildren
      value={score * 10}
      styles={buildStyles({
        rotation: 0.25,
        pathColor: getPathColor()
      })}
    >
      <div>
        <strong className='text-[60px] text-white'>{score}</strong>
      </div>
      <div className='pt-0 text-white text-[25px]'>CVSS Score</div>
    </CircularProgressbarWithChildren>
  )
}