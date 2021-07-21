#!/usr/bin/bash

#set -e
# keep track of the last executed command
#trap 'last_command=$current_command; current_command=$BASH_COMMAND' DEBUG
# echo an error message before exiting
#trap 'echo "\"${last_command}\" command failed with exit code $?." >&2' EXIT

bin_dir=""

inputFile=$1
outputDir=$2
CYTOBAND=$3
ALL=$4
AFR=$5
AMR=$6
EAS=$7
EUR=$8
SAS=$9
EXAC=${10}
DBNSFP=${11}
CLINVAR=${12}
INTERVAR=${13}
DATABASES="refGene";
OPERATION="gx"
#python sumstat2avinput.py $1  # argument1 is the summary statistic file we want to annotate
# here we convert it into annovar input format. the output is avinput_version.txt file

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
  DATABASES="${DATABASES},EXAC.sites.2015_08"
  OPERATION="${OPERATION},f"
fi
if [[ $DBNSFP == true ]]
then
  DATABASES="${DATABASES},DBNSFP.sites.2015_08"
  OPERATION="${OPERATION},f"
fi
if [[ $DBNSFP == true ]]
then
  DATABASES="${DATABASES},DBNSFP.sites.2015_08"
  OPERATION="${OPERATION},f"
fi
if [[ $CLINVAR == true ]]
then
  DATABASES="${DATABASES},CLINVAR.sites.2015_08"
  OPERATION="${OPERATION},f"
fi
if [[ $INTERVAR == true ]]
then
  DATABASES="${DATABASES},INTERVAR.sites.2015_08"
  OPERATION="${OPERATION},f"
fi

#echo $DATABASES
#echo $OPERATION

perl "${bin_dir}/table_annovar.pl" "${inputFile}" "${bin_dir}/humandb/" -buildver hg19 \
    -out "${outputDir}/annotation_output" -remove -protocol ${DATABASES} \
    -operation $OPERATION -nastring . -csvout -polish -xref "${bin_dir}/example/gene_xref.txt"

#echo "the output file is annotation_output.refGene.variant_function "
#less annotation_output.refGene.variant_function
#this is the final output we are looking for. 
