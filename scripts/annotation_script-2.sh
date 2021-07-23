#!/usr/bin/bash

#set -e
# keep track of the last executed command
#trap 'last_command=$current_command; current_command=$BASH_COMMAND' DEBUG
# echo an error message before exiting
#trap 'echo "\"${last_command}\" command failed with exit code $?." >&2' EXIT

bin_dir="/local/datasets"

inputFile=$1
outputDir=$2
DATABASES=$3
OPERATION=$4
#python sumstat2avinput.py $1  # argument1 is the summary statistic file we want to annotate
# here we convert it into annovar input format. the output is avinput_version.txt file

#echo $DATABASES
#echo $OPERATION

perl "${bin_dir}/table_annovar.pl" "${inputFile}" "${bin_dir}/humandb/" -buildver hg19 \
  -out "${outputDir}/annotation_output" -remove -protocol "${DATABASES}" \
  -operation "${OPERATION}" -nastring . -csvout -polish -xref "${bin_dir}/example/gene_xref.txt"

#echo "the output file is annotation_output.refGene.variant_function "
#less annotation_output.refGene.variant_function
#this is the final output we are looking for.
