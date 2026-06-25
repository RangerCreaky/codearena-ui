Optimizations
-----------------
1. When a room has chosen some questiosn, the testcases for the same should be stored in cache, so that each submission won't need fetching it from s3


SUBMIT RELATED
--------------------
17. run a code
16. Submitting a code should be tested e2e (right now)
17. SUbmission debounce


QUESTIONS RELATED
----------------------
3. Question choosing UI
4. Run code
5. skeleton code
6. Copy pasting huge lines of code should be called out
7. changin browser tabs should be called out and both should lead to cancelling marks


ENDGAME and leaderboard RELATED
-----------------------
10. Handle endgame
13. Host should be allowed to end the game in whatever state that is
14. What if a player finishes the game way before everyone else, keeping him in the room is useless


Others
---------
15. Host should be allowed to update the settings.
1. When session expired you need to redirect to login page
2. Refresh - done for websockets


NOT THIS VERSION
-----------------------
19. You redirect the users back to the lobby even in it's waiting state, but you should bot do that ( I guess? )
20. pong disconnect like skribble does, if you are not doing anything for some time continuously then kick them out of the room , that should trigger player left...
8. When websocket doesn't connect you need to kick the host out of the room, and assign the room to be stale. (Later some way to may be revive the stale rooms or reuse old rooms)