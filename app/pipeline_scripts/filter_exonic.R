#!/usr/bin/env Rscript

# Title     : TODO
# Objective : TODO
# Created by: daref
# Created on: 27/08/2021

args = commandArgs(trailingOnly=TRUE)
#files needed
input_file <- ""
output_path <- ""

#get arguments
if (length(args) >= 1) {
  input_file <- args[1]
  output_path <- args[2]
  gene_db <- args[3]
  #   print(output_path)

  input_snps <- read.delim(input_file, header=FALSE)
  marker_name <- input_snps[,6]
  myanno <- read.csv(paste(output_path, "deleteriousness_output.hg19_multianno.csv", sep="/"))
  allsnps <- cbind(myanno, marker_name);
  columnName <- paste('Func.', 'refGene', sep='');
  if(gene_db == 'ucsc'){
    columnName <- paste('Func.', 'knownGene', sep='');
  }else if(gene_db == 'ensembl'){
    columnName <- paste('Func.', 'ensGene', sep='');
  }
  exons <- allsnps[which(allsnps[columnName] == 'exonic'),]
  write.table(exons, paste(output_path,'deleteriousness_output.hg19_multianno_full.tsv', sep='/'),sep='\t',row.names=FALSE, quote=F)

  library(ggplot2)
  columnName <- paste('ExonicFunc.', 'refGene', sep='');
  if(gene_db == 'ucsc'){
    columnName <- paste('ExonicFunc.', 'knownGene', sep='');
  }else if(gene_db == 'ensembl'){
    columnName <- paste('ExonicFunc.', 'ensGene', sep='');
  }

  data <- table(exons[columnName])
  data <- as.data.frame(data, stringsAsFactors=F)
  data[data=='na'] <- 'NA'
  data$Freq <- as.integer(data$Freq)
  colnames(data) <- c('name', 'frequency')
  ggplot(data, aes(x=name, y=frequency, fill=name)) +
    geom_bar(stat="identity", color="white", width=0.75) +
    xlab('Exon annotations') +
    guides(fill=guide_legend(title="Exon annotations")) +
    theme(axis.text.x=element_blank())

  ggsave(paste(output_path, 'exon_plot.jpg', sep = '/'), units="in", width=5, height=4, dpi=320)
}
