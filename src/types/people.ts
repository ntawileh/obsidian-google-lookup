export type PersonResult = {
	type?: string;
	displayNameLastFirst?: string;
	firstName?: string;
	lastName?: string;
	middleName?: string;
	birthdays?: (string | null | undefined)[];
	emails?: (string | null | undefined)[];
	phones?: (string | null | undefined)[];
	org?: {
		title?: string | null;
		department?: string | null;
	};
	accountSource: string;
	resourceName: string | undefined | null;
};
