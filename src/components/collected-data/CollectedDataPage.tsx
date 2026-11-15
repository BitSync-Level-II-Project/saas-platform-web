import { useState } from "react";
import {
  reviewLabels,
  type CollectedRecordSummary,
  type ReviewStatus,
} from "./collectedDataTypes";

import { RecordDetailsModal } from "./RecordDetailsModal";

import { downloadCollectedRecordsCsv } from "./exportCollectedRecords";

import "./CollectedDataPage.css";

type CollectedDataPageProps = {
  records: CollectedRecordSummary[];
  onReview: (id: string, status: ReviewStatus, note: string) => Promise<void>;
};

const receivedTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Colombo",
});

export function CollectedDataPage({
  records,
  onReview,
}: CollectedDataPageProps) {
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [warehouseFilter, setWarehouseFilter] = useState("all");
  const [reviewFilter, setReviewFilter] = useState("all");
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);

  const warehouses = [
    ...new Set(records.map((record) => record.warehouse)),
  ].sort();

  const query = searchText.trim().toLowerCase();

  const filteredRecords = records.filter((record) => {
    const searchableText = [
      record.id,
      record.taskId,
      record.templateName,
      record.warehouse,
      record.location,
      record.submittedBy,
    ]
      .join(" ")
      .toLowerCase();

    const matchesSearch = searchableText.includes(query);

    const matchesWarehouse =
      warehouseFilter === "all" || record.warehouse === warehouseFilter;

    const matchesReview =
      reviewFilter === "all" || record.reviewStatus === reviewFilter;

    return matchesSearch && matchesWarehouse && matchesReview;
  });

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visibleRecords = filteredRecords.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  const overview = Object.entries(reviewLabels).map(([status, label]) => ({
    status,
    label,
    count: records.filter((record) => record.reviewStatus === status).length,
  }));

  const selectedRecord = records.find(
    (record) => record.id === selectedRecordId,
  );

  function clearFilters() {
    setSearchText("");
    setWarehouseFilter("all");
    setReviewFilter("all");
    setPage(1);
  }

  return (
    <section className="collected-data" aria-labelledby="collected-data-title">
      <div className="collected-data__heading">
        <h1 id="collected-data-title">Collected data</h1>

        <span className="collected-data__sample">Sample data</span>

        <button
          type="button"
          className="collected-data__export"
          disabled={filteredRecords.length === 0}
          onClick={() => downloadCollectedRecordsCsv(filteredRecords)}
        >
          Export CSV
        </button>
      </div>

      <p className="collected-data__subtitle">
        Review received records from your warehouses.
      </p>

      <div className="collected-data__stats">
        {overview.map((item) => (
          <div key={item.status} className="collected-data__stat">
            <span>{item.label}</span>
            <strong>{item.count}</strong>
          </div>
        ))}
      </div>

      <div className="collected-data__toolbar">
        <input
          type="search"
          placeholder="Search record, task or person"
          aria-label="Search collected records"
          value={searchText}
          onChange={(event) => {
            setSearchText(event.currentTarget.value);
            setPage(1);
          }}
        />

        <select
          aria-label="Filter records by warehouse"
          value={warehouseFilter}
          onChange={(event) => {
            setWarehouseFilter(event.currentTarget.value);
            setPage(1);
          }}
        >
          <option value="all">All warehouses</option>

          {warehouses.map((warehouse) => (
            <option key={warehouse} value={warehouse}>
              {warehouse}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter records by review status"
          value={reviewFilter}
          onChange={(event) => {
            setReviewFilter(event.currentTarget.value);
            setPage(1);
          }}
        >
          <option value="all">All review statuses</option>

          {Object.entries(reviewLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <button type="button" onClick={clearFilters}>
          Clear
        </button>
      </div>

      <div className="table-card">
        <div className="table-scroll">
          <table className="template-table collected-data__table">
            <caption className="collected-data__caption">
              Received records · Times in Asia/Colombo
            </caption>

            <thead>
              <tr>
                <th scope="col">Record</th>
                <th scope="col">Warehouse</th>
                <th scope="col">Submitted by</th>
                <th scope="col">Received</th>
                <th scope="col">Review</th>
                <th scope="col">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="collected-data__empty">
                    {records.length === 0
                      ? "No collected records yet."
                      : "No records match your filters."}
                  </td>
                </tr>
              ) : (
                visibleRecords.map((record) => (
                  <tr key={record.id}>
                    <td>
                      <strong>{record.templateName}</strong>
                      <small>
                        {record.id} · {record.taskId}
                      </small>
                    </td>

                    <td>{record.warehouse}</td>

                    <td>{record.submittedBy}</td>

                    <td>
                      <time dateTime={record.receivedAt}>
                        {receivedTimeFormatter.format(
                          new Date(record.receivedAt),
                        )}
                      </time>
                    </td>

                    <td>
                      <span
                        className={
                          `collected-data__status ` +
                          `collected-data__status--${record.reviewStatus}`
                        }
                      >
                        {reviewLabels[record.reviewStatus]}
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="text-action"
                        aria-label={`View record ${record.id}`}
                        onClick={() => setSelectedRecordId(record.id)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="table-footer tm-pagination">
          <span role="status">
            {filteredRecords.length} of {records.length} records
            {" · "}Page {currentPage} of {totalPages}
          </span>
          <button
            className="tm-button"
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setPage(currentPage - 1)}
          >
            Previous
          </button>
          <button
            className="tm-button"
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setPage(currentPage + 1)}
          >
            Next
          </button>
        </div>
      </div>

      {selectedRecord && (
        <RecordDetailsModal
          key={selectedRecord.id}
          record={selectedRecord}
          onClose={() => setSelectedRecordId(null)}
          onReview={onReview}
        />
      )}
    </section>
  );
}
