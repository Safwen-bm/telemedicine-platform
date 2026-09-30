import { Link } from "react-router-dom";
import { BsArrowRight } from "react-icons/bs";

const DoctorCard = ({ doctor }) => {
  const { name, averageRating, totalRating, photo, specialization, experiences } =
    doctor;

  const hospital = experiences?.[0]?.hospital;

  return (
    <article className="group overflow-hidden rounded-[14px] border border-line bg-paper transition-shadow duration-300 hover:shadow-panelShadow">
      <div className="flex h-56 w-full items-center justify-center bg-mint">
        {photo ? (
          <img
            src={photo}
            alt={name ? `Portrait of ${name}` : "Doctor"}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-[14px] text-textColor">No photo available</span>
        )}
      </div>

      <div className="space-y-2 p-5">
        <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-primaryColor">
          {specialization || "Specialty not set"}
        </p>
        <h3 className="truncate font-heading text-[24px] font-semibold text-headingColor">
          {name || "Unknown doctor"}
        </h3>
        <p className="truncate text-[14px] text-textColor">
          {hospital ? `At ${hospital}` : "Hospital info unavailable"}
        </p>

        <div className="flex items-center justify-between border-t border-line pt-4">
          <span className="flex items-center gap-1.5 text-[14px] text-headingColor">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="#F2B84B" aria-hidden="true">
              <path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z" />
            </svg>
            <span className="font-semibold">{Number(averageRating) || 0}</span>
            <span className="text-textColor">({totalRating || 0})</span>
          </span>

          <Link
            to={`/doctors/${doctor._id}`}
            className="inline-flex items-center gap-2 text-[14px] font-semibold text-ink transition-colors hover:text-coral"
          >
            View profile <BsArrowRight />
          </Link>
        </div>
      </div>
    </article>
  );
};

export default DoctorCard;