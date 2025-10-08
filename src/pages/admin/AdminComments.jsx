import Card from '../../components/ui/Card';

const AdminComments = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Comments Moderation</h1>
      <Card className="p-8 text-center">
        <div className="text-6xl mb-4">💬</div>
        <h2 className="text-xl font-semibold mb-2">Comments Moderation</h2>
        <p className="text-slate-600 dark:text-slate-400">
          Review and moderate user comments
        </p>
      </Card>
    </div>
  );
};

export default AdminComments;
