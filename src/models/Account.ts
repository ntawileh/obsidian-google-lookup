import { people_v1, calendar_v3 } from 'googleapis';

export class GoogleAccount {
	#credentialsFile: string;
	#tokenFile: string;
	#accountName: string;

	#peopleService: people_v1.People | undefined;
	#calendarService: calendar_v3.Calendar | undefined;

	static #allAccounts: Record<string, GoogleAccount> = {};

	constructor(name: string, credsFile: string, tokenFile: string) {
		this.#accountName = name;
		this.#credentialsFile = credsFile;
		this.#tokenFile = tokenFile;
		GoogleAccount.#allAccounts[name] = this;
	}

	public get tokenFile() {
		return this.#tokenFile;
	}

	public get accountName() {
		return this.#accountName;
	}

	public get credentialsFile() {
		return this.#credentialsFile;
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
