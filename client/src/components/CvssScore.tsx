import { CircularProgressbarWithChildren } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

interface Props {
  score: number;
};

export default function CvssScore({ score }: Props) {
  return (
    <CircularProgressbarWithChildren value={score * 10}>
      <div>
        <strong className='text-[60px] text-white'>{score}</strong>
      </div>
      <div className='pt-0 text-white text-[25px]'>CVSS Score</div>
    </CircularProgressbarWithChildren>
  )
}