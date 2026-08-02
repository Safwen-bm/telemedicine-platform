import { useState } from "react";
import { AiFillStar } from "react-icons/ai";
import { formateDate } from "../../utils/formateDate";
import FeedbackForm from "./FeedbackForm";

const Feedback = ({ reviews, totalRating }) => {
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);

  return (
    <div className="space-y-8">
      <div>
        <h4 className="text-2xl font-semibold text-gray-900">
          All Reviews ({totalRating || 0})
        </h4>
        <div className="mt-6 space-y-6">
          {reviews?.length > 0 ? (
            reviews.map((review, index) => (
              <div key={index} className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex gap-4">
                  <figure className="w-12 h-12 rounded-full overflow-hidden">
                    <img className="w-full h-full object-cover" src={review?.user?.photo} alt="Avatar" />
                  </figure>
                  <div>
                    <h5 className="text-lg font-semibold text-gray-900">{review?.user?.name}</h5>
                    <p className="text-sm text-blue-600">{formateDate(review?.createdAt)}</p>
                    <p className="text-gray-600 mt-2 leading-relaxed text-base">{review.reviewText}</p>
                  </div>
                </div>
                <div className="flex gap-1 items-center">
                  {[...Array(review?.rating).keys()].map((_, index) => (
                    <AiFillStar key={index} color="#0067FF" size={20} />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 italic">No reviews yet.</p>
          )}
        </div>
      </div>

      <div className="text-center">
        <button
          className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-all duration-200"
          onClick={() => setShowFeedbackForm(true)}
        >
          Give Feedback
        </button>
      </div>

      {showFeedbackForm && <FeedbackForm />}
    </div>
  );
};

export default Feedback;