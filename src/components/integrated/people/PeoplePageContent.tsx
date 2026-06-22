"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { IconPlus, IconSearch } from "@/components/leaflet/icons";
import { useBusinesses, usePeople } from "hooks";
import IntegratedTopbar from "../IntegratedTopbar";
import PeopleSidebar from "./PeopleSidebar";
import PersonDetailPanel from "./PersonDetailPanel";
import {
  businessHookFilters,
  businessStatusLabel,
  isBusinessFilter,
  pageTitle,
  parsePeopleFilter,
  peopleHookFilters,
  personStatusLabel,
} from "./peopleFilters";

export default function PeoplePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filter = parsePeopleFilter(searchParams.get("filter"));
  const isBusinessesView = isBusinessFilter(filter);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const selectedFromUrl = searchParams.get("selected");

  const peopleFilters = useMemo(
    () => ({ search: debouncedSearch || undefined, ...peopleHookFilters(filter) }),
    [debouncedSearch, filter]
  );

  const businessFilters = useMemo(
    () => ({ search: debouncedSearch || undefined, ...businessHookFilters(filter) }),
    [debouncedSearch, filter]
  );

  const {
    people,
    loading: peopleLoading,
    error: peopleError,
  } = usePeople({
    autoFetch: !isBusinessesView,
    filters: peopleFilters,
  });

  const {
    businesses,
    loading: businessesLoading,
    error: businessesError,
  } = useBusinesses({
    autoFetch: isBusinessesView,
    filters: businessFilters,
  });

  const loading = isBusinessesView ? businessesLoading : peopleLoading;
  const error = isBusinessesView ? businessesError : peopleError;

  useEffect(() => {
    if (isBusinessesView) return;
    if (people.length === 0) {
      setSelectedId(null);
      return;
    }
    if (selectedFromUrl && people.some((p) => p.id === selectedFromUrl)) {
      setSelectedId(selectedFromUrl);
      return;
    }
    if (selectedId && people.some((p) => p.id === selectedId)) return;
    setSelectedId(people[0]?.id ?? null);
  }, [isBusinessesView, people, selectedFromUrl, selectedId]);

  const selected = people.find((p) => p.id === selectedId) ?? people[0] ?? null;

  useEffect(() => {
    if (!detailOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDetailOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [detailOpen]);

  function handleSelectPerson(id: string) {
    setSelectedId(id);
    setDetailOpen(true);
    const params = new URLSearchParams(searchParams.toString());
    params.set("selected", id);
    router.replace(`/people?${params.toString()}`, { scroll: false });
  }

  return (
    <>
      <IntegratedTopbar
        primaryAction={
          <button type="button" className="lf-btn lf-btn--accent">
            <IconPlus />
            Add neighbor
          </button>
        }
      />
      <div className="lf-main">
        <div className="lf-sidebar-col">
          <PeopleSidebar />
        </div>
        <div className="lf-content-col">
          <main
            className={`lf-canvas lf-canvas--white lf-people-layout${!isBusinessesView && detailOpen && selected ? "" : " lf-people-layout--single"}`}
          >
            <div className="lf-people-main">
              <div className="lf-page-header">
                <h1 className="lf-h1">{pageTitle(filter)}</h1>
                <label className="lf-search">
                  <IconSearch />
                  <input
                    type="search"
                    placeholder={isBusinessesView ? "Search businesses…" : "Search for names…"}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </label>
              </div>

              {error ? (
                <p className="lf-meta lf-people-table-message">{error}</p>
              ) : loading ? (
                <p className="lf-meta lf-people-table-message">Loading…</p>
              ) : isBusinessesView ? (
                businesses.length === 0 ? (
                  <p className="lf-meta lf-people-table-message">No businesses found.</p>
                ) : (
                  <div className="lf-table-wrap">
                    <table className="lf-table">
                      <thead>
                        <tr>
                          <th>Business</th>
                          <th>Address</th>
                          <th>Email</th>
                          <th>Phone</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {businesses.map((business) => (
                          <tr key={business.id}>
                            <td>
                              <span className="lf-person-name-cell">
                                {business.business_name ?? "—"}
                              </span>
                            </td>
                            <td className="lf-meta">{business.address ?? "—"}</td>
                            <td className="lf-meta">{business.email ?? "—"}</td>
                            <td className="lf-meta">{business.phone ?? "—"}</td>
                            <td>{businessStatusLabel(business)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              ) : people.length === 0 ? (
                <p className="lf-meta lf-people-table-message">No neighbors found.</p>
              ) : (
                <div className="lf-table-wrap">
                  <table className="lf-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Address</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {people.map((person) => (
                        <tr
                          key={person.id}
                          className={selectedId === person.id ? "selected" : undefined}
                          onClick={() => handleSelectPerson(person.id)}
                        >
                          <td>
                            <span className="lf-person-name-cell">{person.full_name ?? "—"}</span>
                          </td>
                          <td className="lf-meta">{person.address ?? "—"}</td>
                          <td className="lf-meta">{person.email ?? "—"}</td>
                          <td className="lf-meta">{person.phone ?? "—"}</td>
                          <td>{personStatusLabel(person)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            {!isBusinessesView && detailOpen && selected ? (
              <PersonDetailPanel person={selected} onClose={() => setDetailOpen(false)} />
            ) : null}
          </main>
        </div>
      </div>
    </>
  );
}
