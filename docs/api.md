# API

This plugin exposes an API that other plugins can use to lookup people and events.

## Enabling the API

For security reasons, the API is disabled by default. A user must explicitly enable it before any other plugin can access it. This is done in the plugin's settings under **Advanced -> Expose API to other plugins**.

Enabling this option requires the user to complete a security confirmation to ensure they understand the risks. Please instruct your users to perform this one-time setup step if your plugin depends on the Google Lookup API.

## Accessing the API

To access the API, you need to get the plugin instance from Obsidian's plugin manager. It is recommended to wait for the plugin to be loaded before accessing the API.

```javascript
const googleLookupPlugin = app.plugins.plugins['obsidian-google-lookup'];
if (googleLookupPlugin) {
  const api = googleLookupPlugin.api;
  if (api !== undefined) {
    // You can now use the api object
  } else {
    // Handle the case where the API is not available
    // (the user has not enabled it in settings)
  }
} else {
  // Handle the case where the plugin is not enabled or available
}
```

## API Methods

The API object provides the following methods:

### getAccounts()

Returns a list of all configured Google account names.

**Returns:** `Promise<string[]>` - A promise that resolves to an array of account name strings.

**Example:**

```javascript
const accountNames = await api.getAccounts();
console.log(accountNames);
// Output: ['account1@gmail.com', 'account2@work.com']
```

### people(query, [accountName])

Searches for people in your Google Contacts and Directory.

**Parameters:**

* `query` (string): The search query.
* `accountName` (string, optional): The name of a specific account to query. If not provided, all accounts will be searched.

**Returns:** `Promise<PersonResult[]>` - A promise that resolves to an array of person results.

### events(query, [accountName])

Searches for events in your Google Calendar.

**Parameters:**

* `query` (moment.Moment): A moment.js object representing the date for which to fetch events.
* `accountName` (string, optional): The name of a specific account to query. If not provided, all accounts will be searched.

**Returns:** `Promise<EventResult[]>` - A promise that resolves to an array of event results.

## Example

Here is an example of how to use the API from a Templater user script:

```javascript
async function lookup(tp) {
  const api = app.plugins.plugins['obsidian-google-lookup']?.api;
  if (!api) {
    new Notice("Google Lookup plugin or its API is not enabled.");
    return;
  }

  // Get available accounts
  const accounts = await api.getAccounts();
  console.log("Available accounts:", accounts);

  const personQuery = await tp.system.prompt("Enter name to search");
  if (personQuery) {
    // Search all accounts for a person
    const allPeople = await api.people(personQuery);
    console.log("People (all accounts):", allPeople);

    // Or search a specific account if available
    if (accounts.length > 0) {
      const peopleInFirstAccount = await api.people(personQuery, accounts[0]);
      console.log(`People (${accounts[0]}):`, peopleInFirstAccount);
    }
  }

  // Search for today's events
  const todaysEvents = await api.events(moment());
  console.log("Today's Events:", todaysEvents);
}

module.exports = lookup;
```
