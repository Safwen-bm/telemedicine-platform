import { useMemo, useState } from "react";
import { Search, Users } from "lucide-react";
import { toast } from "react-toastify";
import useFetchData from "../../hooks/useFetchData";
import { useAuth } from "../../context/AuthContext";
import { BASE_URL } from "../../config";
import Loader from "../../components/Loader/Loading";
import ErrorMsg from "../../components/Error/Error";
import { PanelHeader, EmptyState, Modal, inputClass } from "../../components/ui/dashboard.jsx";

const Patients = () => {
  const { token } = useAuth();
  const { data, loading, error, refetch } = useFetchData(`${BASE_URL}/users/admin/patients`);
  const [search, setSearch] = useState("");
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const total = Array.isArray(data) ? data.length : 0;

  const patients = useMemo(() => {
    const list = Array.isArray(data) ? data : [];
    const q = search.trim().toLowerCase();
    return list
      .filter((p) => !q || p.name?.toLowerCase().includes(q) || p.email?.toLowerCase().includes(q))
      .sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  }, [data, search]);

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`${BASE_URL}/users/${toDelete._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(result.message || "Failed to delete patient");

      toast.success("Patient deleted");
      setToDelete(null);
      refetch();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <PanelHeader
        title="Patients"
        description={total ? `${total} registered ${total === 1 ? "patient" : "patients"}` : undefined}
      />

      <div className="relative mb-6 md:w-1/2">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-textColor" />
        <input
          type="search"
          placeholder="Search by name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`${inputClass} pl-12`}
          aria-label="Search patients"
        />
      </div>

      {loading && total === 0 && <Loader />}
      {error && total === 0 && <ErrorMsg errMessage={error} />}

      {!(loading && total === 0) && !(error && total === 0) && (
        patients.length > 0 ? (
          <ul className="space-y-3">
            {patients.map((p) => (
              <li
                key={p._id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-[14px] border border-line bg-white p-4"
              >
                <div className="flex min-w-0 items-center gap-4">
                  {p.photo ? (
                    <img
                      src={p.photo}
                      alt={p.name}
                      className="h-12 w-12 shrink-0 rounded-full border border-line object-cover"
                    />
                  ) : (
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-paper font-heading text-[18px] text-primaryColor">
                      {(p.name || "P").charAt(0).toUpperCase()}
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="truncate font-heading text-[18px] font-semibold text-headingColor">
                      {p.name || "Unnamed patient"}
                    </p>
                    <p className="truncate text-[14px] text-textColor">{p.email}</p>
                    {(p.gender || p.bloodType) && (
                      <p className="text-[13px] capitalize text-textColor">
                        {[p.gender, p.bloodType && `Blood ${p.bloodType}`].filter(Boolean).join(" / ")}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setToDelete(p)}
                  className="rounded-[8px] border border-red-200 bg-white px-4 py-2 text-[14px] font-semibold text-red-700 transition-colors hover:bg-red-50"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={Users}
            title={search ? "No patient matches your search" : "No patients yet"}
            text={search ? "Try another name or email." : "Patients appear here after they sign up."}
          />
        )
      )}

      {toDelete && (
        <Modal
          title="Delete this patient?"
          onClose={() => !deleting && setToDelete(null)}
          footer={
            <>
              <button
                type="button"
                disabled={deleting}
                onClick={() => setToDelete(null)}
                className="rounded-[8px] border border-line bg-white px-4 py-2 text-[14px] font-semibold text-headingColor hover:border-primaryColor"
              >
                Keep patient
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={confirmDelete}
                className="rounded-[8px] bg-red-700 px-4 py-2 text-[14px] font-semibold text-white hover:bg-red-800 disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete permanently"}
              </button>
            </>
          }
        >
          <p className="text-[15px] leading-7 text-textColor">
            <strong className="text-headingColor">{toDelete.name}</strong> will be deleted with their
            appointments (paid upcoming ones are refunded), medical notes, medical folder and
            reviews. This cannot be undone.
          </p>
        </Modal>
      )}
    </div>
  );
};

export default Patients;