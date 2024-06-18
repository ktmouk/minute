import { RunningTimeEntryForm } from "./_components/RunningTimeEntryForm";
import { TimeEntryTimeline } from "./_components/TimeEntryTimeline";

const Page = () => {
  return (
    <div className="p-6 max-w-5xl">
      <RunningTimeEntryForm />
      <TimeEntryTimeline />
    </div>
  );
};

export default Page;
