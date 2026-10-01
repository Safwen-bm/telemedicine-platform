import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AiFillStar } from "react-icons/ai";
import { toast } from "react-toastify";
import { BASE_URL } from "../../config";
import { useAuth } from "../../context/AuthContext.jsx";
import { inputClass } from "../../components/ui/dashboard.jsx";

const FeedbackForm = ({ onSubmitted }) => {
  const { token } = useAuth();
  const { id } = useParams();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [loading, setLoading] = useState(false);

  if (!token) {
    return (
      <p className="rounded-[10px] border border-line bg-white p-5 text-[15px] text-textColor">
        <Link to="/login" className="font-semibold text-primaryColor hover:underline">
          Log in
        </Link>{" "}
        to share your experience with this doctor.
      </p>
    );
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!rating || !reviewText.trim()) {
      return toast.error("Please add a rating and a short comment");
    }

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/doctors/${id}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating, reviewText: reviewText.trim() }),
      });

      const result = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(result.message || "Could not submit your review");

      toast.success(result.message || "Thank you for your feedback");
      setRating(0);
      setHover(0);
      setReviewText("");
      onSubmitted?.();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmitReview} className="space-y-6">
      <div>
        <h3 className="font-heading text-[20px] font-semibold text-headingColor">
          Rate your experience
        </h3>
        <div className="mt-3 flex gap-1" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              aria-label={`${value} star${value > 1 ? "s" : ""}`}
              aria-pressed={rating === value}
              className={`text-[30px] transition-colors ${
                value <= (hover || rating) ? "text-yellowColor" : "text-line"
              }`}
              onClick={() => setRating(value)}
              onMouseEnter={() => setHover(value)}
              onDoubleClick={() => {
                setHover(0);
                setRating(0);
              }}
            >
              <AiFillStar />
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-heading text-[20px] font-semibold text-headingColor">
          Share your feedback
        </h3>
        <textarea
          className={`${inputClass} mt-3`}
          rows="5"
          placeholder="Write your feedback here..."
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-[8px] bg-primaryColor px-6 py-3 font-semibold text-white transition-colors hover:bg-ink disabled:opacity-50"
      >
        {loading ? "Submitting..." : "Submit feedback"}
      </button>
    </form>
  );
};

export default FeedbackForm;