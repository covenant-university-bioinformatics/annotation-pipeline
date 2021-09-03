#!/bin/bash

#set -e
# keep track of the last executed command
#trap 'last_command=$current_command; current_command=$BASH_COMMAND' DEBUG
# echo an error message before exiting
#trap 'echo "\"${last_command}\" command failed with exit code $?." >&2' EXIT

bin_dir="/local/datasets/annovar"

inputFile=$1
outputDir=$2
GENE_DB=$3

DATABASES="refGene";
OPERATION="gx,f"

if [ "$GENE_DB" = "ucsc" ]; then
  DATABASES="knownGene"
fi

if [ "$GENE_DB" = "ensembl" ]; then
  DATABASES="ensGene"
fi

DATABASES="${DATABASES},dbnsfp33a"

echo $DATABASES
echo $OPERATION

perl "${bin_dir}/table_annovar.pl" "${inputFile}" "${bin_dir}/humandb/" -buildver hg19 \
    -out "${outputDir}/deleteriousness_output" -remove -protocol ${DATABASES} \
    -operation $OPERATION -nastring na -csvout -polish

#run rscript
Rscript pipeline_scripts/filter_exonic.R ${inputFile} ${outputDir} ${GENE_DB}