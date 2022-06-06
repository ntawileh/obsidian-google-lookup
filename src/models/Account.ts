import { GoogleCredentials } from '@/types';
import { calendar_v3 } from '@googleapis/calendar';
import { people_v1 } from '@googleapis/people';

export class GoogleAccount {
	static #credentials: GoogleCredentials;
	#tokenFile: string;
	#accountName: string;

	#peopleService: people_v1.People | undefined;
	#calendarService: calendar_v3.Calendar | undefined;

	static #allAccounts: Record<string, GoogleAccount> = {};

	constructor(name: string, tokenFile: string) {
		this.#accountName = name;
		this.#tokenFile = tokenFile;
		GoogleAccount.#allAccounts[name] = this;
	}

	public static get credentials() {
		return GoogleAccount.#credentials;
	}

	public static set credentials(c: GoogleCredentials) {
		GoogleAccount.#credentials = c;
	}

	public get tokenFile() {
		return this.#tokenFile;
	}

	public get accountName() {
		return this.#accountName;
	}

	public set accountName(name: string) {
		this.#accountName = name;
	}

	public set peopleService(service: people_v1.People | undefined) {
		this.#peopleService = service;
	}

	public get peopleService() {
		return this.#peopleService;
	}

	public set calendarService(service: calendar_v3.Calendar | undefined) {
		this.#calendarService = service;
	}

	public get calendarService() {
		return this.#calendarService;
	}

	static getAllAccounts() {
		return Object.values(GoogleAccount.#allAccounts);
	}

	static removeAllAccounts() {
		GoogleAccount.#allAccounts = {};
	}
}
