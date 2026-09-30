const Error = ({ errMessage = "Something went wrong. Please try again." }) => {
  return (
    <div className="flex min-h-[160px] w-full items-center justify-center px-6 text-center">
      <h3 className="font-heading text-[20px] font-semibold leading-[30px] text-headingColor">
        {errMessage}
      </h3>
    </div>
  );
};
export default Error;
