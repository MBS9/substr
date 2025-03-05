import { Typography } from "@mui/material";
import Link from "next/link";

export default function Instructions() {
  return (
    <div>
      <Typography variant='h4'>Instructions</Typography>
      <Typography variant='body1'>
        To use this tool, you need to provide two text files and specify the
        minimum length of the similarities and the ratio of the similarities.
      </Typography>
      <Typography variant='body1'>
        The minimum length is the minimum number of characters that both
        substrings must have to be matched.
      </Typography>
      <Typography variant='body1'>
        The ratio is the minimum ratio of the number of characters in the
        similarity to the number of characters in the text file.
      </Typography>
      <Typography variant='body1'>
        For example, if the ratio is 0.5, then the similarity must have at least
        50% of the characters in the text file.
      </Typography>
      <Typography variant='body1'>
        Max Strikes is the number of further characters that the tool will
        consider after the ratio falls below the set value.
      </Typography>
      <Typography variant='body1'>
        To interpret the results, the tool will highlight the similarities in
        green. Hover your mouse over the output to explore them.
      </Typography>
      <Typography variant='body1'>
        The tool will also display the similarities in a grid with the text
        files side by side.
      </Typography>
      <Typography variant='body1'>
        Between two similar substrings, the tool will calculate the cosine
        similarity of the two substrings and display when the mouse hovers over
        it.
      </Typography>
      <Typography variant='body1'>
        The cosine similarity substrings will also be highlighted (but not in
        green) when you hover your mouse.
      </Typography>
      <Typography variant='body1'>
        If a similar substring is contained withing the cosine similarity
        substring, the affected portion will have a green border.
      </Typography>
      <Typography variant='body1'>
        Finally, to avoid overloading the system, this app will, by default,
        only return the first 70 matches.
      </Typography>
      <br />
      <Link
        href='https://github.com/MBS9/substr?tab=readme-ov-file#the-algorithm'
        className='underline text-blue-600'
      >
        There is a description of the algorithm on GitHub.
      </Link>
    </div>
  );
}
