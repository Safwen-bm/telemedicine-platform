import { useMemo, useState } from "react";
import { AiFillStar } from "react-icons/ai";
import { formateDate } from "../../utils/formateDate";
import FeedbackForm from "./FeedbackForm";

const Stars = ({ value, size = 18 }) => (
  <span className="flex" role="img" aria-label={`${value} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map((n) => (
      <AiFillStar
        key={n}
        size={size}
        className={n <= value ? "text-yellowColor" : "text-line"}
      />
    ))}
  </span>
);

const Feedback = ({ reviews, totalRating, averageRating, onReviewAdded }) => {
  const [showForm, setShowForm] = useState(false);

  const list = useMemo(
    () =>
      [...(reviews || [])].sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      ),
    [reviews]
  );

  const count = list.length || Number(totalRating) || 0;
  const average =
    Number(averageRating) ||
    (list.length
      ? list.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / list.length
      : 0);

  const distribution = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: list.filter((r) => Math.round(Number(r.rating)) === stars).length,
  }));

  return (
    <div className="space-y-10">
      {count > 0 && (
        <div className="grid gap-8 rounded-[14px] border border-line bg-white p-6 sm:grid-cols-[auto_1fr] sm:items-center sm:gap-12">
          <div className="text-center">
            <p className="font-heading text-[64px] font-semibold leading-none text-headingColor">
              {average.toFixed(1)}
            </p>
            <div className="mt-3 flex justify-center">
              <Stars value={Math.round(average)} size={20} />
            </div>
            <p className="mt-2 text-[14px] text-textColor">
              {count} {count === 1 ? "review" : "reviews"}
            </p>
          </div>

          {list.length > 0 && (
            <ul className="space-y-2">
              {distribution.map(({ stars, count: n }) => (
                <li key={stars} className="flex items-center gap-3 text-[13px] text-textColor">
                  <span className="w-10">{stars} star</span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-paper">
                    <span
                      className="block h-full rounded-full bg-yellowColor"
                      style={{ width: `${(n / list.length) * 100}%` }}
                    />
                  </span>
                  <span className="w-6 text-right">{n}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div>
        {list.length > 0 ? (
          <ul className="border-t border-line">
            {list.map((review, index) => {
              const author = review?.user?.name || "Former patient";
              return (
                <li key={review._id || index} className="flex gap-4 border-b border-line py-6">
                  {review?.user?.photo ? (
                    <img
                      className="h-12 w-12 shrink-0 rounded-full border border-line object-cover"
                      src={review.user.photo}
                      alt={author}
                    />
                  ) : (
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-paper font-heading text-[18px] text-primaryColor">
                      {author.charAt(0).toUpperCase()}
                    </span>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-[16px] font-semibold text-headingColor">{author}</p>
                        <p className="text-[13px] text-textColor">
                          {formateDate(review?.createdAt)}
                        </p>
                      </div>
                      <Stars value={Number(review?.rating) || 0} />
                    </div>
                    <p className="mt-3 whitespace-pre-line text-[16px] leading-7 text-textColor">
                      {review.reviewText}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="italic text-textColor">No reviews yet. Be the first to share your experience.</p>
        )}
      </div>

      {showForm ? (
        <div className="rounded-[14px] border border-line bg-white p-6">
          <FeedbackForm
            onSubmitted={() => {
              setShowForm(false);
              onReviewAdded?.();
            }}
          />
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="mt-4 w-full text-center text-[14px] font-semibold text-textColor hover:text-headingColor"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="rounded-[8px] bg-primaryColor px-6 py-3 font-semibold text-white transition-colors hover:bg-ink"
        >
          Give feedback
        </button>
      )}
    </div>
  );
};

export default Feedback;