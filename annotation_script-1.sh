#!/usr/bin/bash

python sumstat2avinput.py $1  # argument1 is the summary statistic file we want to annotate
# here we convert it into annovar input format. the output is avinput_version.txt file
 

perl table_annovar.pl avinput_version.txt humandb/ -buildver hg19 -out annotation_output -remove -protocol refGene,cytoBand,exac03,avsnp147,dbnsfp30a -operation gx,r,f,f,f -nastring . -csvout -polish -xref gene_xref.txt
#here we run annovar 

echo "the output file is annotation_output.refGene.variant_function "
less annotation_output.refGene.variant_function
#this is the final output we are looking for. 
