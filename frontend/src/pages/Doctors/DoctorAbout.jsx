import { formateDate } from "../../utils/formateDate";

const dateRange = (item) => {
  if (!item?.startingDate) return "";
  const end = item.endingDate ? formateDate(item.endingDate) : "Present";
  return `${formateDate(item.startingDate)} - ${end}`;
};

const Eyebrow = ({ children }) => (
  <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-primaryColor">
    {children}
  </p>
);

const TimelineRow = ({ title, subtitle, range }) => (
  <li className="grid gap-1 border-b border-line py-5 sm:grid-cols-[1fr_auto] sm:gap-8">
    <div className="min-w-0">
      <p className="font-heading text-[20px] font-semibold text-headingColor">{title}</p>
      {subtitle && <p className="mt-0.5 text-[15px] text-textColor">{subtitle}</p>}
    </div>
    {range && <p className="text-[13px] text-textColor sm:pt-1.5">{range}</p>}
  </li>
);

const DoctorAbout = ({ about, qualifications, experiences }) => {
  return (
    <div className="space-y-14">
      <section>
        <Eyebrow>Professional summary</Eyebrow>
        {about ? (
          <p className="mt-4 max-w-2xl whitespace-pre-line text-[17px] leading-8 text-textColor">
            {about}
          </p>
        ) : (
          <p className="mt-4 italic text-textColor">This doctor has not added a summary yet.</p>
        )}
      </section>

      <section>
        <Eyebrow>Qualifications</Eyebrow>
        {qualifications?.length > 0 ? (
          <ul className="mt-4 border-t border-line">
            {qualifications.map((item, index) => (
              <TimelineRow
                key={item._id || index}
                title={item.degree || "Degree not specified"}
                subtitle={item.university || "University not specified"}
                range={dateRange(item)}
              />
            ))}
          </ul>
        ) : (
          <p className="mt-4 italic text-textColor">No qualifications listed.</p>
        )}
      </section>

      <section>
        <Eyebrow>Professional experience</Eyebrow>
        {experiences?.length > 0 ? (
          <ul className="mt-4 border-t border-line">
            {experiences.map((item, index) => (
              <TimelineRow
                key={item._id || index}
                title={item.position || "Position not specified"}
                subtitle={item.hospital || "Hospital not specified"}
                range={dateRange(item)}
              />
            ))}
          </ul>
        ) : (
          <p className="mt-4 italic text-textColor">No experience listed.</p>
        )}
      </section>
    </div>
  );
};

export default DoctorAbout;