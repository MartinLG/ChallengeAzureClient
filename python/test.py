import redis
import hashlib
import thread

r = redis.StrictRedis(host='localhost', port=6379, db=0)

valmax = 308915775
nbthread = 8

def int2base(x,b,alphabet='abcdefghijklmnopqrstuvwxyz'):
    'convert an integer to its string representation in a given base'
    if b<2 or b>len(alphabet):
        if b==64: # assume base64 rather than raise error
            alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
        else:
            raise AssertionError("int2base base out of range")
    if isinstance(x,complex): # return a tuple
        return ( int2base(x.real,b,alphabet) , int2base(x.imag,b,alphabet) )
    if x<=0:
        if x==0:
            return alphabet[0]
        else:
            return  '-' + int2base(-x,b,alphabet)
    # else x is non-negative real
    rets=''
    while x>0:
        x,idx = divmod(x,b)
        rets = alphabet[idx] + rets
    return rets

def setHashs(start, end):
    for x in xrange(start, end):
		key = int2base(x, 26)
		if len(key) < 6:
			key = '0'*(6-len(key)) + key
		hash_object = hashlib.sha1(str.encode(key + '!$9'))
		hex_dig = hash_object.hexdigest()
		print key
		print hex_dig
		r.set(hex_dig, key)

bythread = valmax / nbthread

for t in xrange(0,8):
 	thread.start_new_thread( setHashs, (t*bythread, (t+1)*bythread) )