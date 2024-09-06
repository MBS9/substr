export type Pair = {
  a: [number, number];
  b: [number, number];
  similarity: number;
  match: boolean;
  hold?: boolean;
  meta?: string;
};

export type CompareResult = {
  pairs: Pair[];
};

export function cleanText(text: string) {
  const punctuation =  ["，", "。", "：", "；", "「", "」", "？", "\n", "\r", "、", "·", "》", "《", "*"]
  // remove the above chars
  for (const char of punctuation) {
    text = text.replaceAll(char, "");
  }
  return text;
}

export default class API {
  baseUrl: string;
  constructor(endpoint?: string) {
    const baseUrl = endpoint?.endsWith('/') ? endpoint?.substring(0, endpoint.length - 1) : endpoint;
    this.baseUrl = baseUrl || "http://localhost:8000";
  }
  async compare(a: File, b: File, minLength: number, ratio: number) {
    const formData = new FormData();
    let aContent = await a.text();
    aContent = cleanText(aContent);
    let bContent = await b.text();
    bContent = cleanText(bContent);
    formData.append("a", new File([aContent], a.name));
    formData.append("b", new File([bContent], b.name));
    formData.append("min_len", minLength.toString());
    formData.append("ratio", ratio.toString());
    const resp = await fetch(`${this.baseUrl}/compare`, {
      method: "POST",
      body: formData,
    });
    return {aContent, bContent, ...(await resp.json()) as CompareResult};
  }
}
