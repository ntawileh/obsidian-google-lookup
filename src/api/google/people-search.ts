import { people_v1, people } from '@googleapis/people';
import { getAuthClient } from './auth';
import { GoogleServiceOptions, PersonResult } from '@/types';

interface QueryOptions {
	service: people_v1.People;
	accountName: string;
}

export const getPeopleService = async ({ credentials, token }: GoogleServiceOptions) => {
	const auth = await getAuthClient(credentials, token);

	return people({
		version: 'v1',
		auth
	});
};

export const searchContactsAndDirectory = async (
	query: string,
	options: QueryOptions
): Promise<PersonResult[] | undefined> => {
	const directory = await searchDirectory(query, options);
	const contacts = await searchContacts(query, options);

	return directory && contacts ? directory.concat(contacts) : directory ? directory : contacts ? contacts : undefined;
};

export const searchDirectory = async (
	query: string,
	{ service, accountName }: QueryOptions
): Promise<PersonResult[] | undefined> => {
	try {
		const response = await service.people.searchDirectoryPeople({
			query,
			readMask: 'names,nicknames,emailAddresses,phoneNumbers,biographies,calendarUrls,organizations',
			sources: ['DIRECTORY_SOURCE_TYPE_DOMAIN_CONTACT', 'DIRECTORY_SOURCE_TYPE_DOMAIN_PROFILE']
		});

		if (response.status !== 200) {
			console.warn(`error querying people api ${response.statusText}`);
			return;
		}
		if (!response.data?.people || response.data?.people?.length === 0) {
			return [];
		}

		return response.data.people.map((p): PersonResult => {
			const { names, organizations, emailAddresses, phoneNumbers } = p;
			return {
				accountSource: accountName,
				displayNameLastFirst: names && names[0].displayNameLastFirst ? names[0].displayNameLastFirst : 'unknown',
				firstName: names && names[0].givenName ? names[0].givenName : 'unknown',
				lastName: names && names[0].familyName ? names[0].familyName : 'unknown',
				org:
					organizations && organizations[0]
						? { department: organizations[0].department, title: organizations[0].title }
						: undefined,
				type: 'DIRECTORY',
				emails: emailAddresses ? emailAddresses.map((e) => e.value) : [],
				phones: phoneNumbers ? phoneNumbers.map((e) => e.value) : []
			};
		});
	} catch (err: any) {
		console.error(`unable to query directory: ${err.message}`);
	}
};

export const searchContacts = async (
	query: string,
	{ service, accountName }: QueryOptions
): Promise<PersonResult[] | undefined> => {
	try {
		const response = await service.people.searchContacts({
			query,
			readMask: 'names,nicknames,emailAddresses,phoneNumbers,biographies,calendarUrls,organizations',
			sources: ['READ_SOURCE_TYPE_CONTACT', 'READ_SOURCE_TYPE_PROFILE', 'READ_SOURCE_TYPE_DOMAIN_CONTACT']
		});

		if (response.status !== 200) {
			console.warn(`error querying people api ${response.statusText}`);
			return;
		}
		if (!response.data?.results || response.data?.results?.length === 0) {
			return [];
		}

		return response.data.results.map((p): PersonResult => {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			const { names, organizations, emailAddresses, phoneNumbers } = p.person!;
			return {
				accountSource: accountName,
				displayNameLastFirst: names && names[0].displayNameLastFirst ? names[0].displayNameLastFirst : 'unknown',
				firstName: names && names[0].givenName ? names[0].givenName : 'unknown',
				lastName: names && names[0].familyName ? names[0].familyName : 'unknown',
				org:
					organizations && organizations[0]
						? { department: organizations[0].department, title: organizations[0].title }
						: undefined,
				type: 'CONTACTS',
				emails: emailAddresses ? emailAddresses.map((e) => e.value) : [],
				phones: phoneNumbers ? phoneNumbers.map((e) => e.value) : []
			};
		});
	} catch (err: any) {
		console.error(`unable to query contact: ${err.message}`);
	}
};

export const getAuthenticatedUserEmail = async ({ service }: QueryOptions): Promise<string | null | undefined> => {
	try {
		const response = await service.people.get({
			resourceName: 'people/me',
			personFields: 'names,nicknames,emailAddresses'
		});

		if (response.status !== 200) {
			console.warn(`error querying people api ${response.statusText}`);
			return;
		}

		if (response.data && response.data.emailAddresses) {
			return response.data.emailAddresses[0].value;
		}
	} catch (err: any) {
		console.error(`unable to query authenticated user: ${err.message}`);
	}
};
