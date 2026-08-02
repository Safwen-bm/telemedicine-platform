import { useState } from "react";
import { AiFillStar } from "react-icons/ai";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import HashLoader from "react-spinners/HashLoader";
import { BASE_URL, token } from "../../config";

const FeedbackForm = () => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [loading, setLoading] = useState(false);
  const { id } = useParams();

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!rating || !reviewText) {
        setLoading(false);
        return toast.error("Please fill in all fields");
      }

      const res = await fetch(`${BASE_URL}/doctors/${id}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating, reviewText }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message);
      setLoading(false);
      toast.success(result.message);
    } catch (err) {
      setLoading(false);
      toast.error(err.message);
    }
  };

  return (
    <form onClick={handleSubmitReview} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Rate Your Experience</h3>
        <div className="flex gap-2 mt-3">
          {[...Array(5).keys()].map((_, index) => {
            index += 1;
            return (
              <button
                key={index}
                type="button"
                className={`${
                  index <= ((rating && hover) || hover) ? "text-yellow-500" : "text-gray-400"
                } bg-transparent border-none outline-none text-2xl cursor-pointer`}
                onClick={() => setRating(index)}
                onMouseEnter={() => setHover(index)}
                onMouseLeave={() => setHover(rating)}
                onDoubleClick={() => {
                  setHover(0);
                  setRating(0);
                }}
              >
                <AiFillStar />
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900">Share Your Feedback</h3>
        <textarea
          className="border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 w-full px-4 py-3 rounded-lg mt-3 text-gray-700"
          rows="5"
          placeholder="Write your feedback here..."
          onChange={(e) => setReviewText(e.target.value)}
        ></textarea>
      </div>

      <button
        type="submit"
        className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-all duration-200 w-full"
      >
        {loading ? <HashLoader size={25} color="#fff" /> : "Submit Feedback"}
      </button>
    </form>
  );
};

export default FeedbackForm;