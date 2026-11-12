import { describe, expect, it } from "vitest";
import { codeLink, parseLinkCode } from "./linkCode";

describe("Links mit Code", () => {
  it("baut Links mit dem Code hinter #", () => {
    expect(codeLink("sync", "K7QM-4TXP", "https://orbook.orbitium.net")).toBe("https://orbook.orbitium.net/mehr/sync#K7QM-4TXP");
    expect(codeLink("teacher", "ORB-L-4M8T", "https://x.de")).toBe("https://x.de/?zugang=lehrkraft#ORB-L-4M8T");
  });

  it("erkennt Sync-, Lehrer- und Editor-Code", () => {
    expect(parseLinkCode({ pathname: "/mehr/sync", hash: "#K7QM-4TXP-R2AB-9CDE-FGHJ" })).toEqual({ kind: "sync", code: "K7QM-4TXP-R2AB-9CDE-FGHJ" });
    expect(parseLinkCode({ pathname: "/", search: "?zugang=lehrkraft", hash: "#ORB-L-4M8T-K2QX" })).toEqual({ kind: "teacher", code: "ORB-L-4M8T-K2QX" });
    expect(parseLinkCode({ pathname: "/mehr/editor-code", hash: "#ABCD-1234" })).toEqual({ kind: "editor", code: "ABCD-1234" });
  });

  it("ohne Code, fremde Seite oder Unsinn → null", () => {
    expect(parseLinkCode({ pathname: "/mehr/sync", hash: "" })).toBeNull();
    expect(parseLinkCode({ pathname: "/woche", hash: "#K7QM-4TXP" })).toBeNull();
    expect(parseLinkCode({ pathname: "/mehr/sync", hash: "#<script>" })).toBeNull();
    expect(parseLinkCode({ pathname: "/mehr/sync", hash: "#%E0%A4%A" })).toBeNull();
  });
});
