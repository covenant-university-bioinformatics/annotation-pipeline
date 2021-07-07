import numpy
import scipy
import sys
#inFile = sys.argv[1]
writefile = open("avinput_version.txt", "w")
count=0
with open(sys.argv[1], 'r') as file:
    for line in file:
       if count==0:
          count=count +1
          pass
       else:
          split=line.split()
          writefile.write(split[9]+'\t'+split[8]+'\t'+split[8]+'\t'+split[1]+'\t'+split[2]+'\t'+split[0]+'\n' )

writefile.close()

