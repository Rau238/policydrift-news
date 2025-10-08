import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const AdminSettings = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Site Settings</h1>
      
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">General Settings</h2>
        <div className="space-y-4">
          <Input label="Site Name" defaultValue="NewsHub" />
          <Input label="Site Description" defaultValue="Your source for the latest news" />
          <Input label="Contact Email" type="email" defaultValue="contact@newshub.com" />
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">SEO Settings</h2>
        <div className="space-y-4">
          <Input label="Meta Title" defaultValue="NewsHub - Latest News" />
          <Input label="Meta Description" defaultValue="Stay informed with the latest news" />
          <Input label="Meta Keywords" defaultValue="news, articles, blog" />
        </div>
      </Card>

      <div className="flex justify-end">
        <Button>Save Settings</Button>
      </div>
    </div>
  );
};

export default AdminSettings;
