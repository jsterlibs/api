# jswiki.org

jswiki.org rewrite.

## Frontend



## Backend

In order to test, run mongod and execute server.js. Try poking the API after
this. Since the API has been protected using SSL, surf to https://. Note that
if you use some tool such as REST Console at Chrome, you'll need to accept the
dummy cerficate first using your browser. Otherwise it might not work as
expected.

Note that APIKEY has been set to "dummy" by default. If it has been defined on
env, it will use that instead (handy for production env).

### Usage

/libraries, /tags, /licenses. Ie. GET /libraries returns a list of all
libraries in the system. To add one, use POST /libraries, set Content-Type to
"application/x-www-form-urlencoded", set request parameters to name: something
and url: something. That should do it.

If you want to modify or delete some resource, use PUT or DELETE at /<model>/<id> . If you use PUT, remember to set Content-Type and request parameters accordingly (see above).

Examine the schema to see which fields you can and should provide. The API is
on low level by purpose. No verbs here! It's better to implement those
elsewhere.

Note that at the moment API is missing auth. So safe for some local testing
only!

