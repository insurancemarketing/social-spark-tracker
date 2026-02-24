import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function DataDeletion() {
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Data Deletion Instructions</h1>
          <p className="text-sm text-muted-foreground mt-2">
            How to request deletion of your data from Social Spark Tracker
          </p>
        </div>

        <Card className="border-l-4 border-l-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Quick Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p className="font-semibold">
              You can delete all your data from Social Spark Tracker at any time by disconnecting your social media accounts from the Settings page.
            </p>
            <p>
              When you disconnect an account, all associated OAuth tokens and connection data are immediately and permanently deleted from our database.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Method 1: Self-Service Deletion (Instant)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p>
              You can delete your data yourself instantly without contacting us:
            </p>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>Go to the <a href="/settings" className="text-primary underline font-medium">Settings page</a></li>
              <li>Find the social media account you want to remove (YouTube, Facebook, Instagram, etc.)</li>
              <li>Click the <strong>"Disconnect"</strong> button for that account</li>
              <li>Your OAuth tokens and connection data are immediately deleted from our database</li>
            </ol>
            <p className="mt-4 font-semibold">
              This deletion is instant and permanent.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Method 2: Contact Us for Manual Deletion</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p>
              If you prefer to request manual deletion or have questions, you can contact us:
            </p>
            <div className="bg-muted p-4 rounded-lg">
              <p className="font-semibold mb-2">Deletion Request Process:</p>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>Send an email to: <a href="mailto:support@masonvanmeter.com" className="text-primary underline font-medium">support@masonvanmeter.com</a></li>
                <li>Include in your email:
                  <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                    <li>Subject: "Data Deletion Request - Social Spark Tracker"</li>
                    <li>The social media accounts you want to disconnect</li>
                    <li>Any additional context or questions</li>
                  </ul>
                </li>
                <li>We will process your request within <strong>7 business days</strong></li>
                <li>You will receive a confirmation email once deletion is complete</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>What Data Gets Deleted?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p>
              When you disconnect an account or request deletion, the following data is permanently removed:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong>OAuth Access Tokens:</strong> All authentication tokens for the disconnected platform</li>
              <li><strong>Account Identifiers:</strong> Your Facebook Page ID, Instagram Business Account ID, YouTube Channel ID, etc.</li>
              <li><strong>Connection Metadata:</strong> Token expiration dates, connection timestamps, and related configuration</li>
            </ul>
            <p className="mt-4 font-semibold">
              Note: We do not store your actual social media posts, analytics data, or personal content. We only fetch this data in real-time from the platform APIs when you view your dashboard. Therefore, there is no cached content to delete.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>What Happens After Deletion?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Your OAuth tokens are immediately removed from our database</li>
              <li>You will no longer see analytics for the disconnected platform in your dashboard</li>
              <li>The platform's API will no longer be accessible through our application</li>
              <li>You can reconnect the same account at any time by going through the connection process again</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Deletion Timeframes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="space-y-3">
              <div>
                <p className="font-semibold">Self-Service Deletion:</p>
                <p className="text-muted-foreground">Immediate (within seconds)</p>
              </div>
              <div>
                <p className="font-semibold">Manual Deletion Request:</p>
                <p className="text-muted-foreground">Within 7 business days</p>
              </div>
              <div>
                <p className="font-semibold">Database Cleanup:</p>
                <p className="text-muted-foreground">Deleted records are permanently removed from all backups within 30 days</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Third-Party Platform Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p>
              Deleting your data from Social Spark Tracker only removes the data we store (OAuth tokens and connection settings). It does NOT delete your social media accounts or data stored by:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Facebook/Meta</li>
              <li>Instagram</li>
              <li>YouTube/Google</li>
              <li>TikTok</li>
            </ul>
            <p className="mt-4">
              To delete data from these platforms, you must follow their respective deletion processes:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Facebook: <a href="https://www.facebook.com/help/contact/260749603972907" className="text-primary underline" target="_blank" rel="noopener noreferrer">Delete Your Account</a></li>
              <li>Instagram: <a href="https://help.instagram.com/370452623149242" className="text-primary underline" target="_blank" rel="noopener noreferrer">Delete Your Account</a></li>
              <li>YouTube: <a href="https://support.google.com/youtube/answer/55759" className="text-primary underline" target="_blank" rel="noopener noreferrer">Delete Your Channel</a></li>
              <li>TikTok: <a href="https://support.tiktok.com/en/account-and-privacy/deleting-an-account" className="text-primary underline" target="_blank" rel="noopener noreferrer">Delete Your Account</a></li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Questions?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p>
              If you have questions about data deletion or our data handling practices:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Email us at: <a href="mailto:support@masonvanmeter.com" className="text-primary underline">support@masonvanmeter.com</a></li>
              <li>Review our <a href="/privacy" className="text-primary underline">Privacy Policy</a></li>
              <li>Visit our <a href="/settings" className="text-primary underline">Settings page</a> to manage your connections</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
