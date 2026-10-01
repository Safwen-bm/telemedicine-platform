import { useState } from "react";
import { toast } from "react-toastify";
import { BASE_URL } from "../../config.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { Modal } from "../../components/ui/dashboard.jsx";

const CONFIRM_WORD = "DELETE";

const DeleteAccount = ({ user }) => {
  const { token, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [deleting, setDeleting] = useState(false);

  const close = () => {
    if (deleting) return;
    setOpen(false);
    setTyped("");
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`${BASE_URL}/users/${user._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(result.message || "Could not delete your account");

      toast.success("Your account has been deleted");
      logout();
    } catch (err) {
      toast.error(err.message);
      setDeleting(false);
    }
  };

  return (
    <div className="mt-8 rounded-[14px] border border-red-200 bg-white p-6 md:p-8">
      <h3 className="font-heading text-[20px] font-semibold text-red-800">Danger zone</h3>
      <p className="mt-2 max-w-xl text-[15px] leading-7 text-textColor">
        Deleting your account removes your profile and your appointments. This
        cannot be undone.
      </p>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-5 rounded-[8px] border border-red-300 px-5 py-2.5 text-[14px] font-semibold text-red-700 transition-colors hover:bg-red-50"
      >
        Delete my account
      </button>

      {open && (
        <Modal
          title="Delete your account?"
          onClose={close}
          footer={
            <>
              <button
                type="button"
                onClick={close}
                disabled={deleting}
                className="rounded-[8px] border border-line bg-white px-4 py-2 text-[14px] font-semibold text-headingColor hover:border-primaryColor"
              >
                Keep my account
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={typed !== CONFIRM_WORD || deleting}
                className="rounded-[8px] bg-red-700 px-4 py-2 text-[14px] font-semibold text-white transition-colors hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {deleting ? "Deleting..." : "Delete permanently"}
              </button>
            </>
          }
        >
          <p className="text-[15px] leading-7 text-textColor">
            To confirm, type{" "}
            <strong className="text-headingColor">{CONFIRM_WORD}</strong> below.
          </p>
          <input
            type="text"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            className="mt-4 w-full rounded-[8px] border border-line px-4 py-3 text-[15px] focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-600/20"
            placeholder={CONFIRM_WORD}
            autoFocus
          />
        </Modal>
      )}
    </div>
  );
};

export default DeleteAccount;