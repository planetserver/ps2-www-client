import redis
from PIL import Image
import urllib2

pngImage = Image.open("test_post.png")

r = redis.Redis(
    host='localhost',
    port=6379)

response = urllib2.urlopen("http://localhost:8080/python/test_post.png", timeout=30)

#img = open("test_post.png","rb").read()
#r.set("image",img)
imageFile = response.read()
r.set("image1", imageFile)

bytes = r.get("image2")
print bytes
#image.save("output_file.png")
