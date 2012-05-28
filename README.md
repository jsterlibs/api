# jswiki.org - Backend

In order to test, run mongod and execute server.js. Poke the API using curl or
some other utility after this.

### Usage

/libraries, /tags, /licenses. Ie. GET /libraries returns a list of all
libraries in the system. To add one, use POST /libraries, set Content-Type to
"application/x-www-form-urlencoded", set request parameters to name: something
and url: something. That should do it.

If you want to modify or delete some resource, use PUT or DELETE at /<model>/<id> . If you use PUT, remember to set Content-Type and request parameters accordingly (see above).

Examine the schema to see which fields you can and should provide. The API is
on low level by purpose. No verbs here! It's better to implement those
elsewhere.

