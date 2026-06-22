"use client";

import { useMemo, useState } from "react";
import { IconChevronDown, IconPlus, IconSearch } from "@/components/leaflet/icons";
import IntegratedTopbar from "../IntegratedTopbar";
import { MOCK_PEOPLE } from "../mockData";
import PeopleSidebar from "./PeopleSidebar";
import PersonDetailPanel from "./PersonDetailPanel";

export default function PeoplePageContent() {
  const [selectedId, setSelectedId] = useState("2");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    return MOCK_PEOPLE.filter((p) => {
      const matchesSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.email.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || p.status.toLowerCase() === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

  const selected = MOCK_PEOPLE.find((p) => p.id === selectedId) ?? filtered[0] ?? MOCK_PEOPLE[0];

  return (
    <>
      <IntegratedTopbar
        center={
          <button type="button" className="lf-context-ribbon">
            {MOCK_PEOPLE.length} people
            <IconChevronDown />
          </button>
        }
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
          <main className="lf-canvas lf-canvas--white lf-people-layout">
            <div className="lf-people-main">
              <div className="lf-page-header">
                <h1 className="lf-h1">All people</h1>
                <div className="lf-card-actions">
                  <button type="button" className="lf-small-btn">
                    Export
                  </button>
                  <button type="button" className="lf-btn lf-btn--accent">
                    <IconPlus />
                    Add person
                  </button>
                </div>
              </div>

              <div className="lf-filters">
                <label className="lf-search">
                  <IconSearch />
                  <input
                    type="search"
                    placeholder="Search for names…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </label>
                <select
                  className="lf-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">Status</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

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
                    {filtered.map((person) => (
                      <tr
                        key={person.id}
                        className={selectedId === person.id ? "selected" : undefined}
                        onClick={() => setSelectedId(person.id)}
                      >
                        <td>
                          <span className="lf-person-name-cell">
                            <span className="lf-person-dot" style={{ background: person.dotColor }} />
                            {person.name}
                          </span>
                        </td>
                        <td className="lf-meta">{person.address}</td>
                        <td className="lf-meta">{person.email}</td>
                        <td className="lf-meta">{person.phone}</td>
                        <td>{person.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <PersonDetailPanel person={selected} />
          </main>
        </div>
      </div>
    </>
  );
}
