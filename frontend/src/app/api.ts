export type Pair = {
  a: [number, number];
  b: [number, number];
  similarity: number;
  match: boolean;
};

export type CompareResult = {
  pairs: Pair[];
};

export default class API {
  baseUrl: string;
  constructor(endpoint?: string) {
    this.baseUrl = endpoint || "http://localhost:8000";
  }
  async compare(a: File, b: File, minLength: number, ratio: number) {
    const formData = new FormData();
    formData.append("a", a);
    formData.append("b", b);
    formData.append("min_len", minLength.toString());
    formData.append("ratio", ratio.toString());
    formData.append("g-recaptcha-response", "dummy");
    const resp = await fetch(`${this.baseUrl}/compare`, {
      method: "POST",
      body: formData,
    });
    return (await resp.json()) as CompareResult;
  }
}
