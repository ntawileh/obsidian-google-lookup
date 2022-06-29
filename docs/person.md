# People Info

![](images/contact-insert.gif)

## Command Input

The input is a string search against Google Contacts. Anything that Google Contacts accepts as a query parameter will be supported. First/Last names, emails...etc

When nothing has been input yet, the following criteria will be applied as default (in order):

- if some text is selected use that as a default query
- use the filename as a default query

### Move/Rename

If the option to move/rename the note is enabled (default is enabled), after the content from the person template is inserted:

- the note will be renamed according to the `filename format` option. the default here is `{{lastname}}, {{firstname}}`. Any field in the template fields listed below can be used
- the note will be moved to the directory specified in Settings. By default, this is blank which means the file would be renamed but will not be moved to any other directory

> If the first option below `Rename and move person file` is not enabled, the other two settings have no effect.

> When specifying your own filename format, make sure you pick something that continues to be unique across several contacts. i.e. picking `{{firstname}}` is valid, but obviously will not work out well if you have two contacts with the same first name.

> If you specify a directory to move the contact file to, make sure that directory exists!

![](images/person-move-settings.png)

## Template

### Default Template

```
---
aliases: ["{{lastfirst}}", "{{firstlast}}", "{{firstname}}.{{lastname}}", {{emails}}]
created: ["{{date}} {{time}}"]
---
# {{firstname}} {{lastname}}
#person #person/{{source}}

{{org.title}} {{org.department}}

----

## Contact Info

Email: {{emails}}
Phone: {{phones}}


----

## Log

### [[{{date}}]] {{time}} - Created
```

The intention with this default template is to be used to create a new note rather than inserting into an existing one, although that can be customized by changing the template.

### Template Fields

Fields are variables enclosed in `{{` `}}` and will be replaced when the content is generated.

| Field          | Description                                                                                                                                                                                                    |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| firstName      |                                                                                                                                                                                                                |
| lastName       |                                                                                                                                                                                                                |
| middleName     |                                                                                                                                                                                                                |
| firstLast      | "Firstname Lastname" ex: `Stewie Griffin`                                                                                                                                                                      |
| lastFirst      | "Lastname, First" ex: `Griffin, Stewie`                                                                                                                                                                        |
| emails         | Email(s), joined by `,`                                                                                                                                                                                        |
| phones         | Phone number(s), joined by `,`                                                                                                                                                                                 |
| birthdays      | birthday(s) stored for the contact in year-month-day format, joined by `,`                                                                                                                                     |
| org.title      | Title of contact in company directory (if applicable)                                                                                                                                                          |
| org.department | Person's department in company directory (if applicable)                                                                                                                                                       |
| type           | Passed along from Google API. Possible values [here](https://developers.google.com/people/api/rest/v1/people#Person.SourceType). Useful to differentiate a contact vs. someone obtained from company directory |
| source         | will return the google account from where this event was fetched                                                                                                                                               |
| link           | will return the url, if available, to open the contact on Google Contacts                                                                                                                                      |

### Customizing Template

You can create your own template in a file, and include a link to that file in Settings for `Event Template`. For example, you can create a note in `_assets/templates/` called `t_event` and then provide the path `_assets/templates/t_event` in Settings
