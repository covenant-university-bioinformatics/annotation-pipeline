#!/bin/bash


echo "Running"

#set -e
# keep track of the last executed command
#trap 'last_command=$current_command; current_command=$BASH_COMMAND' DEBUG
# echo an error message before exiting
#trap 'echo "\"${last_command}\" command failed with exit code $?." >&2' EXIT

bin_dir="/local/datasets/annovar"

inputFile=$1
outputDir=$2
GENE_DB=$3
CYTOBAND=$4
ALL=$5
AFR=$6
AMR=$7
EAS=$8
EUR=$9
SAS=$10
EXAC=${11}
DISGENET=${12}
CLINVAR=${13}
INTERVAR=${14}

DATABASES="refGene";
OPERATION="gx"

echo $DATABASES
echo $OPERATION

if [ "$GENE_DB" = "ucsc" ]; then
  DATABASES="knownGene"
fi

if [ "$GENE_DB" = "ensembl" ]; then
  DATABASES="ensGene"
fi

if [[ $CYTOBAND == true ]]
then
  DATABASES="${DATABASES},cytoBand"
  OPERATION="${OPERATION},r"
fi
if [[ $ALL == true ]]
then
  DATABASES="${DATABASES},ALL.sites.2015_08"
  OPERATION="${OPERATION},f"
fi
if [[ $AFR == true ]]
then
  DATABASES="${DATABASES},AFR.sites.2015_08"
  OPERATION="${OPERATION},f"
fi
if [[ $AMR == true ]]
then
  DATABASES="${DATABASES},AMR.sites.2015_08"
  OPERATION="${OPERATION},f"
fi
if [[ $EAS == true ]]
then
  DATABASES="${DATABASES},EAS.sites.2015_08"
  OPERATION="${OPERATION},f"
fi
if [[ $EUR == true ]]
then
  DATABASES="${DATABASES},EUR.sites.2015_08"
  OPERATION="${OPERATION},f"
fi
if [[ $SAS == true ]]
then
  DATABASES="${DATABASES},SAS.sites.2015_08"
  OPERATION="${OPERATION},f"
fi
if [[ $EXAC == true ]]
then
  DATABASES="${DATABASES},exac03"
  OPERATION="${OPERATION},f"
fi
if [[ $CLINVAR == true ]]
then
  DATABASES="${DATABASES},clinvar_20170130"
  OPERATION="${OPERATION},f"
fi
if [[ $INTERVAR == true ]]
then
  DATABASES="${DATABASES},intervar_20170202"
  OPERATION="${OPERATION},f"
fi

echo $DATABASES
echo $OPERATION

perl "${bin_dir}/table_annovar.pl" "${inputFile}" "${bin_dir}/humandb/" -buildver hg19 \
    -out "${outputDir}/annotation_output" -remove -protocol ${DATABASES} \
    -operation $OPERATION -nastring . -csvout -polish -xref "${bin_dir}/example/gene_xref.txt"

#run rscript
Rscript pipeline_scripts/disgenet_script.R ${DISGENET} ${inputFile} ${outputDir} ${GENE_DB}

#echo "the output file is annotation_output.refGene.variant_function "
#less annotation_output.refGene.variant_function
#this is the final output we are looking for. 
