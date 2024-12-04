function contactsTemplate(contact) {
  return `
      <li id="contact-item-${contact.id}" onclick="showContactDetails(${
    contact.id
  })">
          <span id="avatar-${
            contact.id
          }" style="background-color: ${getRandomColor()};">
              ${getInitials(contact.firstName, contact.lastName)}
          </span>
          <div>
              <p id="contact-name-${contact.id}">${contact.firstName} ${
    contact.lastName
  }</p>
              <a id="contact-email-${contact.id}" href="mailto:${
    contact.email
  }">${contact.email}</a>
          </div>
      </li>
    `;
}
