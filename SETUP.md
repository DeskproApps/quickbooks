QuickBooks Set-Up
===

# Company ID

Log into QuickBooks at https://qbo.intuit.com

You can find your company ID by clicking on the 'gear' icon in the top-right, and then 'Additional Info' under the 'Your Company' section.

[![](/docs/setup/quickbooks-setup-01.png)](/docs/setup/quickbooks-setup-01.png)

Next, click the 'copy' button to copy your company ID onto your clipboard.

[![](/docs/setup/quickbooks-setup-02.png)](/docs/setup/quickbooks-setup-02.png)

Then, paste your company ID into the field on the settings drawer of the QuickBooks app in Deskpro.

# Sandbox Mode

If you have a sandbox company (ie if you're a developer), check the 'Use Sandbox' checkbox in the settings drawer of the QuickBooks app in Deskpro.

# Authentication

You can authenticate easily with us with a 1-click install, or if you want to use your own OAuth2 credentials, check the 'Advanced Connect' checkbox to proceed.

## 1-Click Install

Simply paste in your company ID.

When you're happy, click 'Install'.

## Advanced Connect

Log into your Intuit developer account at https://www.developer.intuit.com

Click on 'My Hub' in the top-right, followed by 'App Dashboard'.

[![](/docs/setup/quickbooks-setup-03.png)](/docs/setup/quickbooks-setup-03.png)

Click the 'plus' icon to create a new app, give it a name, and select the `com.intuit.quickbooks.accounting` scope, then create the app.

[![](/docs/setup/quickbooks-setup-04.png)](/docs/setup/quickbooks-setup-04.png)

[![](/docs/setup/quickbooks-setup-05.png)](/docs/setup/quickbooks-setup-05.png)

[![](/docs/setup/quickbooks-setup-06.png)](/docs/setup/quickbooks-setup-06.png)

Copy the 'client ID' and 'client secret', and paste them into the fields in the settings drawer of the QuickBooks app in Deskpro, and keep them somewhere safe. You can also find them again in 'Keys and Credentials' section of the app in the Intuit developer dashboard.

[![](/docs/setup/quickbooks-setup-07.png)](/docs/setup/quickbooks-setup-07.png)

When you're happy, click 'Install'.