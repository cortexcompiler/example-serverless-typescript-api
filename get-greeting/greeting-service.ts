const greetingMap: { [key: string]: string } = {
  Australia: "G'day mate",
  France: 'Bonjour',
  Germany: 'Hallo',
  Italy: 'Ciao',
  UK: 'Wotcha',
  USA: 'Howdy',
  default: 'Hello',
};

export function getGreeting(country: string) {
  const greeting = greetingMap[country] || greetingMap['default'];
  return greeting;
}
