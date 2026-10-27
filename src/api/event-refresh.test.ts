/// <reference types="jest" />
import { QueryClient } from "@tanstack/react-query";

import { queryKeys, refreshEventQueries } from "./hooks";

// A default QueryClient schedules a 5-minute garbage-collection timer per
// cached query, which kept `jest --ci` from exiting after the run.
const newClient = () => new QueryClient({ defaultOptions: { queries: { gcTime: Infinity } } });

describe("refreshEventQueries", () => {
  it("refreshes the night, my RSVP and my check-in together, and nothing else", async () => {
    const client = newClient();
    client.setQueryData(queryKeys.event("evt_1"), { id: "evt_1" });
    client.setQueryData(queryKeys.myRsvp("evt_1"), { rsvp: null });
    client.setQueryData(queryKeys.checkIn("evt_1"), { checkIn: null });
    client.setQueryData(queryKeys.event("evt_2"), { id: "evt_2" });
    client.setQueryData(queryKeys.myRsvps, { items: [] });

    await refreshEventQueries(client, "evt_1");

    const stale = (key: readonly unknown[]) => client.getQueryState(key)?.isInvalidated;
    expect(stale(queryKeys.event("evt_1"))).toBe(true);
    expect(stale(queryKeys.myRsvp("evt_1"))).toBe(true);
    expect(stale(queryKeys.checkIn("evt_1"))).toBe(true);
    expect(stale(queryKeys.event("evt_2"))).toBe(false);
  });

  it("also refreshes my list of nights and the featured night", async () => {
    const client = newClient();
    client.setQueryData(queryKeys.myRsvps, { items: [] });
    client.setQueryData(queryKeys.featuredNight, { event: null, phase: null });

    await refreshEventQueries(client, "evt_1");

    expect(client.getQueryState(queryKeys.myRsvps)?.isInvalidated).toBe(true);
    expect(client.getQueryState(queryKeys.featuredNight)?.isInvalidated).toBe(true);
  });
});
