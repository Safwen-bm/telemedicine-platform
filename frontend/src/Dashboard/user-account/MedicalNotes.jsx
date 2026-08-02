import useFetchData from "../../hooks/useFetchData";
import { BASE_URL } from "../../config";
import Loading from "../../components/Loader/Loading";
import Error from "../../components/Error/Error";
import { formateDate } from "../../utils/formateDate";

const MedicalNotes = () => {
  const {
    data: notes,
    loading,
    error,
  } = useFetchData(`${BASE_URL}/medical-notes`);

  return (
    <div>
      {loading && !error && <Loading />}
      {error && !loading && <Error errMessage={error} />}
      {!loading && !error && (
        <div className="grid grid-cols-1 gap-5">
          {notes.map((note) => (
            <div key={note._id} className="border p-4 rounded-md shadow-md">
              <h3 className="text-lg font-semibold">Dr. {note.doctor?.name || "N/A"}</h3>
              <p>Date: {formateDate(note.createdAt)}</p>
              <p>Diagnosis: {note.diagnosis || "N/A"}</p>
              <p>Prescription: {note.prescription || "N/A"}</p>
              <p>Notes: {note.notes || "N/A"}</p>
            </div>
          ))}
        </div>
      )}
      {!loading && !error && notes.length === 0 && (
        <h2 className="mt-5 text-center text-primaryColor leading-7 text-[20px] font-semibold">
          No medical notes available.
        </h2>
      )}
    </div>
  );
};

export default MedicalNotes;