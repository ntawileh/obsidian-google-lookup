import { searchContactsAndDirectory, getPeopleService } from '@/api/google/people-search';
import { searchCalendarEvents, getCalendarService, getCalendarEventById } from '@/api/google/calendar-search';
import { GoogleAccount } from '@/models/Account';
import { PersonResult, EventResult } from '@/types';
import { isApiExposureEnabled } from '@/settings/api-exposure';

/**
 * Creates a new instance of the GoogleLookupApi if the API is enabled in the settings.
 *
 * @returns {GoogleLookupApi | undefined} A new instance of the GoogleLookupApi, or undefined if the API is not enabled.
 * @export
 */
export function createApi(): GoogleLookupApi | undefined {
	if (isApiExposureEnabled()) {
		return new GoogleLookupApi();
	}
	return undefined;
}

/**
 * The main entry point for the Google Lookup API.
 * This class provides methods for searching for people and calendar events across all connected Google Accounts.
 *
 * @export
 * @class GoogleLookupApi
 */
export class GoogleLookupApi {
	/**
	 * Searches for people (contacts and directory) across all connected Google Accounts.
	 *
	 * @param {string} query The search query.
	 * @param {string} [accountName] Optional. The name of the account to search in. If not provided, all accounts will be searched.
	 * @returns {Promise<PersonResult[]>} A promise that resolves to an array of person results.
	 * @memberof GoogleLookupApi
	 */
	async people(query: string, accountName?: string): Promise<PersonResult[]> {
		const result = await this._execute(
			async (account) => {
				// Get the people service for the account, creating it if it doesn't exist
				if (account.token) {
					account.peopleService = await getPeopleService({
						credentials: GoogleAccount.credentials,
						token: account.token
					});
				}
				if (!account.peopleService) {
					return [];
				}
				// Search for people in the account
				return await searchContactsAndDirectory(query, {
					service: account.peopleService,
					accountName: account.accountName
				});
			},
			{ accountName }
		);
		return (result ?? []) as PersonResult[];
	}

	/**
	 * Searches for calendar events across all connected Google Accounts.
	 *
	 * @param {moment.Moment} query The date to search for events on.
	 * @param {string} [accountName] Optional. The name of the account to search in. If not provided, all accounts will be searched.
	 * @returns {Promise<EventResult[]>} A promise that resolves to an array of event results.
	 * @memberof GoogleLookupApi
	 */
	async events(query: moment.Moment, accountName?: string): Promise<EventResult[]> {
		const result = await this._execute(
			async (account) => {
				// Get the calendar service for the account, creating it if it doesn't exist
				if (account.token) {
					account.calendarService = await getCalendarService({
						credentials: GoogleAccount.credentials,
						token: account.token
					});
				}
				if (!account.calendarService) {
					return [];
				}
				// Search for calendar events in the account
				return await searchCalendarEvents(query, {
					service: account.calendarService,
					accountName: account.accountName
				});
			},
			{ accountName }
		);
		return (result ?? []) as EventResult[];
	}

	/**
	 * Gets a calendar event by its ID.
	 *
	 * @param {string} eventId The ID of the event to get.
	 * @param {string} [accountName] Optional. The name of the account to search in. If not provided, all accounts will be searched.
	 * @returns {(Promise<EventResult | undefined>)} A promise that resolves to the event result, or undefined if the event is not found.
	 * @memberof GoogleLookupApi
	 */
	async eventById(eventId: string, accountName?: string): Promise<EventResult | undefined> {
		const result = await this._execute(
			async (account) => {
				// Get the calendar service for the account, creating it if it doesn't exist
				if (account.token) {
					account.calendarService = await getCalendarService({
						credentials: GoogleAccount.credentials,
						token: account.token
					});
				}
				if (!account.calendarService) {
					return;
				}
				// Get the calendar event by its ID from the account
				return await getCalendarEventById(eventId, {
					service: account.calendarService,
					accountName: account.accountName
				});
			},
			{ accountName, breakOnFirstResult: true }
		);
		if (Array.isArray(result)) {
			return result[0];
		}
		return result;
	}

	/**
	 * Gets the names of all connected Google Accounts.
	 *
	 * @returns {Promise<string[]>} A promise that resolves to an array of account names.
	 * @memberof GoogleLookupApi
	 */
	async getAccounts(): Promise<string[]> {
		return GoogleAccount.getAllAccounts().map((account) => account.accountName);
	}

	/**
	 * Executes a function for each Google Account.
	 * This is a helper function to avoid duplicating code in the public methods.
	 *
	 * @private
	 * @template T The type of the result.
	 * @param {(account: GoogleAccount) => Promise<T | T[] | undefined>} func The function to execute for each account.
	 * @param {{ accountName?: string; breakOnFirstResult?: boolean }} options Options for the execution.
	 * @returns {(Promise<T | T[] | undefined>)} A promise that resolves to the results of the function execution.
	 * @memberof GoogleLookupApi
	 */
	private async _execute<T>(
		func: (account: GoogleAccount) => Promise<T | T[] | undefined>,
		options: { accountName?: string; breakOnFirstResult?: boolean }
	): Promise<T | T[] | undefined> {
		const results: T[] = [];
		const allAccounts = GoogleAccount.getAllAccounts();
		// Filter accounts if an account name is provided
		const accounts = options.accountName
			? allAccounts.filter((a) => a.accountName === options.accountName)
			: allAccounts;

		for (const account of accounts) {
			if (!account) {
				continue;
			}
			// Execute the function for the account
			const result = await func(account);
			if (result) {
				// If we only need the first result, return it immediately
				if (options.breakOnFirstResult) {
					return result;
				}
				// Otherwise, add the result(s) to the list of results
				results.push(...(Array.isArray(result) ? result : [result]));
			}
		}
		// If we were only looking for the first result, but didn't find it, return undefined
		return options.breakOnFirstResult ? undefined : results;
	}
}
