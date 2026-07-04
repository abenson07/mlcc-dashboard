"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
  type PeopleFilter,
} from "./peopleFilters";

type PeoplePageContentProps = {
  embedded?: boolean;
  defaultFilter?: PeopleFilter | null;
  basePath?: string;
};

export default function PeoplePageContent({
  embedded = false,
  defaultFilter = null,
  basePath = "/admin/people",
}: PeoplePageContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filter = parsePeopleFilter(searchParams.get("filter")) ?? defaultFilter;
  const isBusinessesView = isBusinessFilter(filter);

  const [selectedId, setSelectedId] = useState<string | null>(() => searchParams.get("selected"));
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

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
    refetch,
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

  const selectedFromUrl = searchParams.get("selected");

  const selected = selectedId
    ? isBusinessesView
      ? null
      : (people.find((p) => p.id === selectedId) ?? null)
    : null;

  const selectedBusiness = selectedId && isBusinessesView
    ? (businesses.find((b) => b.id === selectedId) ?? null)
    : null;

  const buildPath = useCallback(
    (params: URLSearchParams) => {
      const nextParams = new URLSearchParams(params.toString());
      if (embedded && defaultFilter != null) {
        nextParams.delete("filter");
      }
      const query = nextParams.toString();
      return query ? `${basePath}?${query}` : basePath;
    },
    [basePath, defaultFilter, embedded],
  );

  const clearSelectedFromUrl = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (!params.has("selected")) return;
    params.delete("selected");
    router.replace(buildPath(params), { scroll: false });
  }, [buildPath, router, searchParams]);

  const clearSelection = useCallback(() => {
    setSelectedId(null);
    clearSelectedFromUrl();
  }, [clearSelectedFromUrl]);

  useEffect(() => {
    if (isBusinessesView) {
      if (selectedFromUrl && businesses.some((b) => b.id === selectedFromUrl)) {
        setSelectedId(selectedFromUrl);
        return;
      }
      if (selectedFromUrl && !businesses.some((b) => b.id === selectedFromUrl)) {
        setSelectedId(null);
      }
      return;
    }
    if (selectedFromUrl && people.some((p) => p.id === selectedFromUrl)) {
      setSelectedId(selectedFromUrl);
      return;
    }
    if (selectedFromUrl && !people.some((p) => p.id === selectedFromUrl)) {
      setSelectedId(null);
    }
  }, [businesses, isBusinessesView, people, selectedFromUrl]);

  useEffect(() => {
    if (isBusinessesView) {
      if (selectedId && !businesses.some((b) => b.id === selectedId)) {
        setSelectedId(null);
        clearSelectedFromUrl();
      }
      return;
    }
    if (people.length === 0) return;
    if (selectedId && !people.some((p) => p.id === selectedId)) {
      setSelectedId(null);
      clearSelectedFromUrl();
    }
  }, [businesses, clearSelectedFromUrl, isBusinessesView, people, selectedId]);

  useEffect(() => {
    if (!selected) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") clearSelection();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [clearSelection, selected]);

  function handleSelectPerson(id: string) {
    if (selectedId === id) {
      clearSelection();
      return;
    }

    setSelectedId(id);
    const params = new URLSearchParams(searchParams.toString());
    params.set("selected", id);
    router.replace(buildPath(params), { scroll: false });
  }

  function handleSelectBusiness(id: string) {
    if (selectedId === id) {
      clearSelection();
      return;
    }

    setSelectedId(id);
    const params = new URLSearchParams(searchParams.toString());
    if (!embedded) {
      params.set("filter", "businesses");
    }
    params.set("selected", id);
    router.replace(buildPath(params), { scroll: false });
  }

  const addNeighborAction = (
    <button type="button" className="lf-btn lf-btn--accent">
      <IconPlus />
      Add neighbor
    </button>
  );

  const main = (
    <main
      className={`lf-canvas lf-canvas--white lf-people-layout${(!isBusinessesView && selected) || (isBusinessesView && selectedBusiness) ? "" : " lf-people-layout--single"}`}
    >
      <div className="lf-people-main">
        <div className="lf-page-header">
          <h1 className="lf-h1">{pageTitle(filter)}</h1>
          {embedded ? addNeighborAction : null}
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
                          <tr
                            key={business.id}
                            className={selectedId === business.id ? "selected" : undefined}
                            onClick={() => handleSelectBusiness(business.id)}
                          >
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
            {!isBusinessesView && selected ? (
              <PersonDetailPanel person={selected} onClose={clearSelection} onUpdated={() => void refetch()} />
            ) : null}
            {isBusinessesView && selectedBusiness ? (
              <aside className="lf-people-detail lf-people-detail--business">
                <div className="lf-page-header">
                  <h2 className="lf-h2">{selectedBusiness.business_name ?? "Business"}</h2>
                  <button type="button" className="lf-small-btn" onClick={clearSelection}>
                    Close
                  </button>
                </div>
                <div className="lf-detail-row">
                  <span className="lf-detail-label">Contact</span>
                  <span>{selectedBusiness.contact_name ?? "—"}</span>
                </div>
                <div className="lf-detail-row">
                  <span className="lf-detail-label">Email</span>
                  <span>{selectedBusiness.email ?? "—"}</span>
                </div>
                <div className="lf-detail-row">
                  <span className="lf-detail-label">Phone</span>
                  <span>{selectedBusiness.phone ?? "—"}</span>
                </div>
                <div className="lf-detail-row">
                  <span className="lf-detail-label">Address</span>
                  <span>{selectedBusiness.address ?? "—"}</span>
                </div>
              </aside>
            ) : null}
    </main>
  );

  if (embedded) {
    return main;
  }

  return (
    <>
      <IntegratedTopbar primaryAction={addNeighborAction} />
      <div className="lf-main">
        <div className="lf-sidebar-col">
          <PeopleSidebar />
        </div>
        <div className="lf-content-col">{main}</div>
      </div>
    </>
  );
}
