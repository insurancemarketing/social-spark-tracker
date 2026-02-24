import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicy() {
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p>
              Social Spark Tracker is a personal analytics dashboard that helps you track and analyze your social media performance across multiple platforms including YouTube, Instagram, Facebook, and TikTok.
            </p>
            <p>
              This privacy policy explains how we handle your data when you use our service.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Information We Collect</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <h3 className="font-semibold mb-2">Social Media Data</h3>
              <p>
                When you connect your social media accounts, we access the following information through official platform APIs:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                <li><strong>YouTube:</strong> Channel statistics, video performance metrics, subscriber counts</li>
                <li><strong>Instagram:</strong> Post analytics, follower counts, engagement metrics</li>
                <li><strong>Facebook:</strong> Page insights, post performance, audience data</li>
                <li><strong>TikTok:</strong> Video analytics, follower statistics (when available)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Authentication Data</h3>
              <p>
                We store OAuth access tokens securely to maintain your connections to social media platforms. These tokens are encrypted and stored in our secure database.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How We Use Your Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p>We use your information exclusively to:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Display your social media analytics in a unified dashboard</li>
              <li>Track performance metrics over time</li>
              <li>Generate insights about your content performance</li>
              <li>Maintain authenticated connections to your social media accounts</li>
            </ul>
            <p className="font-semibold mt-4">
              We do NOT sell, share, or distribute your data to third parties.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Storage and Security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p>
              Your data is stored securely using industry-standard encryption practices:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>OAuth tokens are encrypted at rest</li>
              <li>All API communications use HTTPS encryption</li>
              <li>Database access is restricted and monitored</li>
              <li>Data is stored on secure servers provided by Supabase</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Rights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p>You have the following rights regarding your data:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong>Access:</strong> You can view all your data through the dashboard</li>
              <li><strong>Deletion:</strong> You can disconnect any social media account at any time from the Settings page, which will delete all associated tokens and data</li>
              <li><strong>Export:</strong> Your analytics data is visible and accessible through the dashboard at all times</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Third-Party Services</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p>
              We integrate with the following third-party platforms and are subject to their respective privacy policies:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>YouTube (Google) - <a href="https://policies.google.com/privacy" className="text-primary underline" target="_blank" rel="noopener noreferrer">Privacy Policy</a></li>
              <li>Meta (Facebook & Instagram) - <a href="https://www.facebook.com/privacy/policy/" className="text-primary underline" target="_blank" rel="noopener noreferrer">Privacy Policy</a></li>
              <li>TikTok - <a href="https://www.tiktok.com/legal/privacy-policy" className="text-primary underline" target="_blank" rel="noopener noreferrer">Privacy Policy</a></li>
              <li>Supabase (database provider) - <a href="https://supabase.com/privacy" className="text-primary underline" target="_blank" rel="noopener noreferrer">Privacy Policy</a></li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cookies and Local Storage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p>
              We use browser local storage to maintain your login session and store some non-sensitive configuration data locally. We do not use tracking cookies or third-party analytics.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Retention</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p>
              We retain your social media connection data (OAuth tokens) for as long as you keep your accounts connected. When you disconnect an account from the Settings page, all associated tokens are immediately deleted from our database.
            </p>
            <p>
              Cached analytics data may be retained temporarily for performance purposes but is refreshed regularly from the source platforms.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Changes to This Policy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p>
              We may update this privacy policy from time to time. Any changes will be posted on this page with an updated "Last updated" date.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p>
              If you have questions about this privacy policy or how we handle your data, please contact us through the Settings page or visit{" "}
              <a href="https://social.masonvanmeter.com" className="text-primary underline">social.masonvanmeter.com</a>.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
