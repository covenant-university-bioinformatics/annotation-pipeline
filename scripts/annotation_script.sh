#!/usr/bin/bash


read -p "please, enter a summary statistic file: " SUMSTAT

python sumstat2avinput.py $SUMSTAT

perl table_annovar.pl avinput_version.txt humandb/ -buildver hg19 -out annotation_output -remove -protocol refGene,cytoBand,exac03,avsnp147,dbnsfp30a -operation gx,r,f,f,f -nastring . -csvout -polish -xref example/gene_xref.txt

echo "the output file is annotation_output.refGene.variant_function "
less annotation_output.refGene.variant_function
