import { describe, expect, it } from "vitest";
import { decodeDeck, encodeDeck, shareLink } from "./kartenShare";

const DECK = { name: "Unit 3 · Travel", sides: ["Englisch", "Deutsch"], first: "mix", cards: [{ id: "c1", a: "the journey", b: "die Reise", box: 4, due: "2025-09-20" }] };

describe("kartenShare", () => {
  it("туда и обратно — без Lernstand", async () => {
    const code = await encodeDeck(DECK);
    expect(code).toMatch(/^k1\.[A-Za-z0-9_-]+$/);
    expect(await decodeDeck(`#${code}`)).toEqual({ name: "Unit 3 · Travel", sides: ["Englisch", "Deutsch"], first: "mix", cards: [{ a: "the journey", b: "die Reise" }] });
    expect(shareLink("https://orbook.orbitium.net", code)).toBe(`https://orbook.orbitium.net/karten#${code}`);
  });
  it("битая или чужая ссылка — null", async () => {
    expect(await decodeDeck("#k1.kaputt!!")).toBeNull();
    expect(await decodeDeck("#v1.abc")).toBeNull();
    expect(await decodeDeck(null)).toBeNull();
    expect(await decodeDeck(await encodeDeck({ ...DECK, cards: [] }))).toBeNull();
  });
});
