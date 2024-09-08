import Link from "next/link";

export default function Instructions() {
  return (
    <div>
      <h1 className='text-2xl mt-5'>Instructions</h1>
      <p>
        To use this tool, you need to provide two text files and specify the
        minimum length of the similarities and the ratio of the similarities.
      </p>
      <p>
        The minimum length is the minimum number of characters that a similarity
        must have to be considered.
      </p>
      <p>
        The ratio is the minimum ratio of the number of characters in the
        similarity to the number of characters in the text file.
      </p>
      <p>
        For example, if the ratio is 0.5, then the similarity must have at least
        50% of the characters in the text file.
      </p>
      <p>
        Max Strikes is the number of further characters that the tool will
        consider after the ratio falls below the set value.
      </p>
      <p>
        To interpret the results, the tool will highlight the similarities in
        green. Hover your mouse over the output to explore them.
      </p>
      <p>
        The tool will also display the similarities in a grid with the text
        files side by side.
      </p>
      <p>
        Between two similar substrings, the tool will calculate the cosine
        similarity of the two substrings and display when the mouse hovers over
        it.
      </p>
      <p>
        The cosine similarity substrings will also be highlighted (but not in
        green) when you hover your mouse.
      </p>
      <p>
        If a similar substring is contained withing the cosine similarity
        substring, the affected portion will have a green border.
      </p>
      <p>
        Finally, to avoid overloading the system, the API server will, by
        default, only return the first 100 matches.
      </p>
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
