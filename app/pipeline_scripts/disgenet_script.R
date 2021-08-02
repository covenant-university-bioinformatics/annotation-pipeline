#!/usr/bin/env Rscript
args = commandArgs(trailingOnly=TRUE)

#files needed
#curated db files
disgenet_db <- FALSE
input_file <- ""
output_path <- ""
#where data files are located
bin_dir <- "/local/disgenet"


findDiseases <- function(snp) {
  indexes <- grep(snp, curated$snpId)
  result_len <- length(indexes)
  if(result_len >= 1){
    rows <- curated[grep(snp, curated$snpId), c(1,7,8,11,16)]
    return(rows)
  } else{
    row <- data.frame(snpId=snp,diseaseName=NA,diseaseType=NA,score=NA,source=NA);
    return(row)
  }
}

#get arguments
if (length(args) >= 1) {
  
  if(args[1] == "true"){
    disgenet_db <- TRUE
  }
  input_file <- args[2]
  output_path <- args[3]
  print(args[1])
  print(input_file)
  print(output_path)
}

#remember to change the file separator
input_snps <- read.delim(input_file, header=FALSE)

if(disgenet_db == TRUE){
  curated <- read.delim(paste(bin_dir, "curated_variant_disease_associations.tsv",sep='/'), header = T, stringsAsFactors = F)

  #remember to change to correct column name
  output <- lapply(input_snps[,6], findDiseases)
  df <- do.call("rbind", output)

  #colnames(df) <- c('marker', 'DisGeneNet.disease', 'diseaseType', 'score', 'disease source')
  res <- na.omit(df)

  #write to file
  write.table(res, paste(output_path,'disgenet.txt', sep='/'),sep='\t',row.names=FALSE, quote=F)
}

library(ggplot2)
myanno <- read.csv(paste(output_path, "annotation_output.hg19_multianno.csv", sep="/"))

#write snp column to file
marker_name <- input_snps[,6]
allsnps <- cbind(myanno, marker_name);
write.table(allsnps, paste(output_path,'annotation_output.hg19_multianno_full.tsv', sep='/'),sep='\t',row.names=FALSE, quote=F)

#plot snp locations
dd <- table(myanno$Func.refGene)
dd <- as.data.frame(dd)
colnames(dd) <- c('group', 'value')


ggplot(dd, aes(x="", y=value, fill=group)) +
  geom_bar(stat="identity", width=1, color="white") +
  coord_polar("y", start=0) +
  
  theme_void() # remove background, grid, numeric labels

ggsave(paste(output_path, 'snp_plot.jpg', sep = '/'))