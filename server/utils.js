export function canLoggedInUserMoveToken(tokenId, userId, gamemode, hostId) {
  switch (gamemode) {
    case 'god':
      if (hostId === userId) {
        return true;
      }
      if (tokenId === userId) {
        return true;
      }
      return false;
    case 'ffa':
      if (tokenId === userId) {
        return true;
      }
      return false;
    case 'group':
      if (tokenId === userId) {
        return true;
      }
      return false;
  }
}
