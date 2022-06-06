export const DEFAULT_PERSON_TEMPLATE = `
---
aliases: ["{{lastfirst}}", "{{firstlast}}", "{{firstname}}.{{lastname}}", {{emails}}]
created: ["{{date}} {{time}}"]
---
# {{title}}
#person #person/{{source}}

{{org.title}} {{org.department}}

----

## Contact Info

Email: {{emails}}
Phone: {{phones}}


----

## Log

### [[{{date}}]] {{time}} - Created

`;
export const DEFAULT_EVENT_TEMPLATE = `
### {{summary}} 

* {{start}}  - [Link]({{link}})
* organizer {{organizer}}  
* {{attendees}}  
`;
