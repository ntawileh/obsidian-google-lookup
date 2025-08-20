
import { searchContactsAndDirectory, getPeopleService } from '@/api/google/people-search';
import { searchCalendarEvents, getCalendarService } from '@/api/google/calendar-search';
import { GoogleAccount } from '@/models/Account';
import { PersonResult, EventResult } from '@/types';
import { isApiExposureEnabled } from '@/settings/api-exposure';

export function createApi(): GoogleLookupApi | undefined {
    if (isApiExposureEnabled()) {
        return new GoogleLookupApi();
    }
    return undefined;
}

export class GoogleLookupApi {
	async people(query: string, accountName?: string): Promise<PersonResult[]> {
		const results: PersonResult[] = [];
		const allAccounts = GoogleAccount.getAllAccounts();
		const accounts = accountName ? allAccounts.filter((a) => a.accountName === accountName) : allAccounts;

		for (const account of accounts) {
			if (!account) {
				continue;
			}
			if (account.token) {
				account.peopleService = await getPeopleService({
					credentials: GoogleAccount.credentials,
					token: account.token
				});
			}
			if (!account.peopleService) {
				continue;
			}
			const accountResults = await searchContactsAndDirectory(query, {
				service: account.peopleService,
				accountName: account.accountName
			});
			if (accountResults) {
				results.push(...accountResults);
			}
		}
		return results;
	}

	async events(query: moment.Moment, accountName?: string): Promise<EventResult[]> {
		const results: EventResult[] = [];
		const allAccounts = GoogleAccount.getAllAccounts();
		const accounts = accountName ? allAccounts.filter((a) => a.accountName === accountName) : allAccounts;

		for (const account of accounts) {
			if (!account) {
				continue;
			}
			if (account.token) {
				account.calendarService = await getCalendarService({
					credentials: GoogleAccount.credentials,
					token: account.token
				});
			}
			if (!account.calendarService) {
				continue;
			}
			const accountResults = await searchCalendarEvents(query, {
				service: account.calendarService,
				accountName: account.accountName
			});
			if (accountResults) {
				results.push(...accountResults);
			}
		}
		return results;
	}

	async getAccounts(): Promise<string[]> {
		return GoogleAccount.getAllAccounts().map((account) => account.accountName);
	}
}
